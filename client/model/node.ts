import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";
import { KeyOf, Strict, Base } from "@/type/base";
import { NodeChunk } from "@/type/chunk";
import { Def, NodeDef } from "@/type/define";
import { Event, EventDict, EventReq, EventReqDict, EventRes, NodeEvent } from "@/type/event";
import { BaseNodeProps } from "@/type/props";
import { Delegator } from "@/util/proxy";

export namespace Model {
    export type Code<M extends NodeModel> = M['code']
    export type Child<M extends NodeModel> = M['child']
    export type State<M extends NodeModel> = M['state']
    export type Chunk<M extends NodeModel> = M['chunk']
    export type Parent<M extends NodeModel> = M['parent']
}

export abstract class NodeModel<
    T extends Partial<NodeDef> = any
> {
    readonly code: Def.Code<T>;
    readonly parent: Def.Parent<T>;

    constructor(props: BaseNodeProps<T>) {
        this.parent = props.parent;
        this.code = props.code;
        this.uuid = props.uuid || Factory.uuid;

        this.rawState = Delegator.Observed(
            props.state,
            this._onAlter.bind(this, false)
        );
        this._state = { ...this.rawState };
        
        this.eventReq = Delegator.Automic<any>({}, (key) => {
            return new EventReq(this, key, props.event?.[key]);
        });
    }

    
    readonly uuid: string;
    private readonly _uuidDict: Record<string, NodeModel> = {};
    get uuidList() {
        const result: string[] = [];
        let target: NodeModel | undefined = this;
        while (target) {
            result.unshift(target.uuid);
            target = target.parent;
        }
        return result;
    }
    
    public query(uuidList: string[]): NodeModel | undefined {
        for (const uuid of uuidList) {
            if (this._uuidDict[uuid]) {
                return this._uuidDict[uuid].query(
                    uuidList.slice(uuidList.indexOf(uuid) + 1)
                );
            }
        }
        return undefined;
    }

    abstract readonly child: Readonly<Def.Child<T>>;

    protected _onSpawn(data: {
        prev?: NodeModel | NodeModel[],
        next?: NodeModel | NodeModel[]
    }) {
        const { prev, next } = data;
        if (next instanceof Array) next.map(target => target._load());
        if (prev instanceof Array) prev.map(target => target._unload());
        if (next instanceof NodeModel) next._load();
        if (prev instanceof NodeModel) prev._unload();
        this._event.onSpawn(this);
    }

    public useChild(setter: Event<NodeEvent.OnSpawn<typeof this>>){
        this.bind(this.eventReq.onAlter, setter);
        return () => {
            this.unbind(this.eventReq.onAlter, setter);
        };
    }

    protected rawState: Strict<Def.State<T>>;
    private _state: Strict<Def.State<T>>;
    get state(): Readonly<Strict<Def.State<T>>> {
        return { ...this._state };
    }

    protected _onAlter(recursive?: boolean) {
        const prevState = { ...this._state };
        const nextState = { ...this.rawState };
        this._event.onCheck(this, nextState);
        this._state = nextState;
        this._event.onAlter(this, prevState);
        if (recursive) {
            for (const key in this.child) {
                const child: NodeModel | undefined = this.child[key];
                child?._unload();
            }
        }
    }
    
    public useState(setter: Event<NodeEvent.OnAlter<typeof this>>){
        this.bind(this.eventReq.onAlter, setter);
        return () => {
            this.unbind(this.eventReq.onAlter, setter);
        };
    }
    
    protected event: Readonly<Strict<
        EventDict<NodeEvent<typeof this, T>>
    >> = Delegator.Automic<any>({}, (key) => {
        return this._emit.bind(this, key);
    });
    private readonly _event: Readonly<
        EventDict<NodeEvent<typeof this, {}>>
    > = this.event;

    readonly eventReq: Readonly<Strict<
        EventReqDict<NodeEvent<typeof this, T>>
    >>;
    private readonly _eventRes: Map<Base.Func, EventRes> = new Map();
    private readonly _eventDep: 
        Map<EventReq, Base.List<EventRes>> & 
        Map<EventRes, Base.List<EventReq>> = new Map();

    private _emit<K extends KeyOf<NodeEvent<typeof this, T>>>(
        key: K, 
        data: NodeEvent<typeof this, T>[K]
    ) {
        const eventReqList = [
            this.eventReq[key],
            ...this.eventReq[key].alias
        ];
        for (const eventReq of eventReqList) {
            const { target } = eventReq;
            const eventResList = target._eventDep.get(eventReq) || [];
            for (const eventRes of eventResList) {
                eventRes.handler.call(eventRes.target, data);
            }
        }
    }

    protected bind<E extends Base.List>(
        eventReq: EventReq<E>,
        handler: Event<E>
    ) {
        const { target } = eventReq;
        const eventRes = 
            this._eventRes.get(handler) || 
            new EventRes(target, handler);
        this._eventRes.set(handler, eventRes);

        const eventResList = target._eventDep.get(eventReq) || [];
        eventResList.push(eventRes);
        target._eventDep.set(eventReq, eventResList);

        const eventReqList = this._eventDep.get(eventRes) || [];
        eventReqList.push(eventReq);
        this._eventDep.set(eventRes, eventReqList);

        if (eventReq.key.endsWith('Check')) {
            target._onAlter(true);
        }
    }

    protected unbind<E extends Base.List>(
        eventReq: EventReq<E> | undefined,
        handler: Event<E>
    ) {
        const eventRes = this._eventRes.get(handler);
        if (eventRes) {
            const eventReqList = this._eventDep.get(eventRes) || [];
            for (const curEventReq of eventReqList) {
                if (eventReq && curEventReq !== eventReq) continue;
                const { target } = curEventReq;
                const eventResList = target._eventDep.get(curEventReq) || [];
                target._eventDep.set(
                    curEventReq, 
                    eventResList.filter(target => target !== eventRes)
                );
                if (curEventReq.key.endsWith('Check')) {
                    target._onAlter(true);
                }
            }
            this._eventDep.delete(eventRes);
            this._eventRes.delete(handler);
        }
    }


    private readonly _loaders: Base.Func[] = Lifecycle.getLoaders(this);
    private readonly _unloaders: Base.Func[] = Lifecycle.getUnloaders(this);

    private _load() {
        for (const loader of this._loaders) {
            loader.call(this);
        }
        for (const key in this.child) {
            const child: NodeModel | undefined = this.child[key];
            child?._load();
        }
    }

    private _unload() {
        for (const eventPair of this._eventDep) {
            const eventReqOrRes = eventPair[0];
            if (eventReqOrRes instanceof EventReq) {
                const [ eventReq, eventResList ] = eventPair;
                for (const eventRes of eventResList) {
                    eventRes.target.unbind(
                        eventReq,
                        eventRes.handler
                    );
                }
            }
            if (eventReqOrRes instanceof EventRes) {
                const [ eventRes ] = eventPair;
                this.unbind(undefined, eventRes.handler);
            }
        }
        for (const key in this.child) {
            const child: NodeModel | undefined = this.child[key];
            child?._unload();
        }
        for (const unloader of this._unloaders) {
            unloader.call(this);
        }
        if (this.parent) {
            delete this.parent._uuidDict[this.uuid];
        }
    }
    
    get chunk(): NodeChunk<T> {
        return {
            code: this.code,
            uuid: this.uuid,
            state: this.state
        };
    }

    protected _create<M extends NodeModel>(
        chunk: Model.Chunk<M>
    ): M {
        const Type = Factory.products[chunk.code];
        if (!Type) {
            console.error('ModelNotFound:', { chunk });
            throw new Error();
        }
        const instance: M = new Type(chunk, this);
        return instance;
    }

    public debug() {
        console.log(this._eventDep.values());
    }
}

