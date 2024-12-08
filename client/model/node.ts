import { Lifecycle } from "@/service/lifecycle";
import { Valid, KeyOf, Strict, Base } from "@/type/base";
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
    parent: Def.Parent<T>;
    code: Def.Code<T>;
    uuid!: string;

    protected rawState: Strict<Def.State<T>>;
    private _state: Strict<Def.State<T>>;
    get state(): Readonly<Strict<Def.State<T>>> {
        return { ...this._state };
    }

    protected event: Readonly<Strict<
        EventDict<NodeEvent<typeof this, T>>
    >> = Delegator.Automic<any>({}, (key) => {
        return this._emit.bind(this, key);
    });

    readonly eventReq: Readonly<Strict<
        EventReqDict<NodeEvent<typeof this, T>>
    >> = Delegator.Automic<any>({}, (key) => {
        return new EventReq(this, key);
    });

    private readonly _eventRes: Map<Base.Func, EventRes> = new Map();
    private readonly _eventDep: 
        Map<EventReq, Base.List<EventRes>> & 
        Map<EventRes, Base.List<EventReq>> = new Map();

    abstract readonly child: Readonly<Def.Child<T>>;
    protected abstract readonly _childList: NodeModel[];

    constructor(props: BaseNodeProps<T>) {
        this.parent = props.parent;
        this.code = props.code;

        this.rawState = Delegator.Observed(
            props.state,
            this._onModelAlter.bind(this, false)
        );
        this._state = { ...this.rawState };
    }
    
    private _emit<K extends KeyOf<NodeEvent<typeof this, T>>>(
        key: K, 
        data: NodeEvent<typeof this, T>[K]
    ) {
        const eventReqList = this.eventReq[key].alias;
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
            new EventRes(this, handler);
        this._eventRes.set(handler, eventRes);

        const eventResList = target._eventDep.get(eventReq) || [];
        eventResList.push(eventRes);
        target._eventDep.set(eventReq, eventResList);

        const eventReqList = this._eventDep.get(eventRes) || [];
        eventReqList.push(eventReq);
        this._eventDep.set(eventRes, eventReqList);

        if (eventReq.key.endsWith('Check')) {
            target._onModelAlter(true);
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
                    target._onModelAlter(true);
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
        for (const child of this._childList) {
            child._load();
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
                const [ eventRes, eventReqList ] = eventPair;
                this.unbind(undefined, eventRes.handler);
            }
        }
        for (const child of this._childList) {
            child._unload();
        }
        for (const unloader of this._unloaders) {
            unloader.call(this);
        }
        if (this.parent) {
            delete this.parent._refers[this.uuid];
        }
    }

    protected _onModelAlter(recursive?: boolean) {
        const prevState = { ...this._state };
        const tempState = { ...this.rawState };
        // this._baseEvent.onModelCheck({
        //     target: this,
        //     prev: prevState,
        //     next: tempState
        // });
        // const nextState = { 
        //     ...this._state,
        //     ...Decor.GetMutators(this, tempState)
        // };
        // this._prevState = { ...nextState };
        // this._baseEvent.onModelAlter({
        //     target: this,
        //     prev: prevState,
        //     next: nextState
        // });
        // if (recursive) {
        //     if (this.child instanceof Array) {
        //         for (const target of this.child) {
        //             target._onModelAlter(recursive);
        //         }
        //     } else {
        //         for (const key in this.child) {
        //             const target = this.child[key];
        //             if (target instanceof IModel) {
        //                 target._onModelAlter(recursive);
        //             }
        //         }
        //     }
        // }
    }

    get chunk(): NodeChunk<T> {
        return {
            code: this.code,
            uuid: this.uuid,
            state: this.state
        };
    }
}

