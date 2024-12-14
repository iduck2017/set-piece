import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";
import { Base, Dict } from "@/type/base";
import { Chunk } from "@/type/chunk";
import { Def } from "@/type/define";
import { Event } from "@/type/event";
import { Model } from "@/type/model";
import { Props } from "@/type/props";
import { Delegator } from "@/util/proxy";

export type NodeEvent<T extends Def> = {
    onStateAlter: NodeEvent.OnStateAlter<T>
    onStateCheck: NodeEvent.OnStateCheck<T>
    onChildSpawn: NodeEvent.OnChildSpawn<T>
}
export namespace NodeEvent {
    export type OnStateAlter<T extends Def> = [
        Model<T>, 
        Readonly<Def.ParamDict<T> & Def.StateDict<T>>
    ]
    export type OnChildSpawn<T extends Def> = [Model<T>]
    export type OnStateCheck<T extends Def> = [Model<T>, Def.ParamDict<T>]
}

export abstract class NodeModel<T extends Def> {
    readonly code: Def.Code<T>;
    readonly parent: Def.Parent<T>;

    constructor(props: Props.Strict<T>) {
        this.code = props.code;
        this.parent = props.parent;
        this.uuid = props.uuid || Factory.uuid;
        
        this.baseStateDict = Delegator.Observed(
            props.stateDict,
            this._onStateAlter.bind(this, false)
        );
        this._baseParamDict = props.paramDict;
        this._prevStateDict = { ...this.baseStateDict };
        this._paramDict = { ...this._baseParamDict };

        this.eventEmitterDict = Delegator.Automic({}, (key) => {
            return new Event.Emitter(this, key, props.eventGrid?.[key]);
        });

        const childList = Delegator.Observed(
            props.childList?.map(chunk => this._createChild(chunk)) || [],
            this._onChildSpawn.bind(this)
        );
        this.childList = Delegator.Readonly(childList);
        this._childChunkList = Delegator.Formatted(
            childList,
            (model) => model?.chunk,
            (chunk) => this._createChild(chunk) 
        );

        const origin: any = {};
        for (const key in props.childDict) {
            origin[key] = this._createChild(props.childDict[key]);
        }
        const childDict = Delegator.Observed(
            origin,
            this._onChildSpawn.bind(this)
        );
        this.childDict = Delegator.Readonly(childDict);
        this._childChunkDict = Delegator.Formatted(
            childDict,
            (model) => model?.chunk,
            (chunk) => this._createChild(chunk) 
        );
    }
    
    public debug() {
        console.log(this.stateDict);
    }

    readonly childList: Readonly<Def.ChildList<T>>;    
    readonly childDict: Readonly<Def.ChildDict<T>>;
    protected readonly _childChunkDict: Chunk.Dict<Def.ChildDict<T>>;
    protected readonly _childChunkList: Base.List<Model.Chunk<Def.ChildList<T>[number]>>;
    private _onChildSpawn(data: {
        prev?: Model | Model[],
        next?: Model | Model[]
    }) {
        const { prev, next } = data;
        if (next instanceof Array) next.map(target => target._load());
        if (prev instanceof Array) prev.map(target => target._unload());
        if (next instanceof NodeModel) next._load();
        if (prev instanceof NodeModel) prev._unload();
        this._eventDict.onChildSpawn(this);
    }
    public useChild(setter: Event<NodeEvent.OnChildSpawn<T>>){
        this.bindEvent(this.eventEmitterDict.onChildSpawn, setter);
        return () => {
            this.unbindEvent(this.eventEmitterDict.onChildSpawn, setter);
        };
    }
    protected _createChild<M extends Model>(
        chunk: Model.Chunk<M>
    ): M {
        const Type = Factory.productDict[chunk.code];
        if (!Type) {
            console.error('Model Not Found', { chunk });
            throw new Error();
        }
        const instance: M = new Type({
            ...chunk,
            parent: this
        });
        return instance;
    }

    
    protected eventDict: Readonly<Event.Dict<NodeEvent<T> & Def.EventDict<T>>> = 
        Delegator.Automic({}, (key) => {
            return this._emitEvent.bind(this, key);
        });
    private readonly _eventDict: Readonly<Event.Dict<NodeEvent<T>>> = this.eventDict;

    readonly eventEmitterDict: Readonly<Event.EmitterDict<NodeEvent<T> & Def.EventDict<T>>>;
    private readonly _eventHandlerMap: Map<Base.Func, Event.Handler> = new Map();
    private readonly _eventVectorMap: 
        Map<Event.Emitter, Base.List<Event.Handler>> & 
        Map<Event.Handler, Base.List<Event.Emitter>> = new Map();

    private _emitEvent<K extends Dict.Key<NodeEvent<T> & Def.EventDict<T>>>(
        key: K, 
        ...args: (NodeEvent<T> & Def.EventDict<T>)[K]
    ) {
        const eventEmitterList = [
            this.eventEmitterDict[key],
            ...this.eventEmitterDict[key].alias
        ];
        for (const eventEmitter of eventEmitterList) {
            const { target } = eventEmitter;
            const eventHandlerList = target._eventVectorMap.get(eventEmitter) || [];
            for (const eventHandler of eventHandlerList) {
                eventHandler.handler.call(eventHandler.target, ...args);
            }
        }
    }
    protected bindEvent<E extends Base.List>(
        eventEmitter: Event.Emitter<E>,
        handler: Event<E>
    ) {
        const { target } = eventEmitter;
        const eventHandler = 
            this._eventHandlerMap.get(handler) || 
            new Event.Handler(target, handler);
        this._eventHandlerMap.set(handler, eventHandler);

        const eventHandlerList = target._eventVectorMap.get(eventEmitter) || [];
        eventHandlerList.push(eventHandler);
        target._eventVectorMap.set(eventEmitter, eventHandlerList);

        const eventEmitterList = this._eventVectorMap.get(eventHandler) || [];
        eventEmitterList.push(eventEmitter);
        this._eventVectorMap.set(eventHandler, eventEmitterList);

        if (eventEmitter.key.endsWith('Check')) {
            target._onStateAlter(true);
        }
    }
    protected unbindEvent<E extends Base.List>(
        eventEmitter: Event.Emitter<E> | undefined,
        handler: Event<E>
    ) {
        const eventHandler = this._eventHandlerMap.get(handler);
        if (eventHandler) {
            const eventEmitterList = this._eventVectorMap.get(eventHandler) || [];
            for (const curEventEmitter of eventEmitterList) {
                if (eventEmitter && curEventEmitter !== eventEmitter) continue;
                const { target } = curEventEmitter;
                const eventHandlerList = target._eventVectorMap.get(curEventEmitter) || [];
                target._eventVectorMap.set(
                    curEventEmitter, 
                    eventHandlerList.filter(target => target !== eventHandler)
                );
                if (curEventEmitter.key.endsWith('Check')) {
                    target._onStateAlter(true);
                }
            }
            this._eventVectorMap.delete(eventHandler);
            this._eventHandlerMap.delete(handler);
        }
    }
    

    private readonly _baseParamDict: Def.ParamDict<T>;
    private _paramDict: Def.ParamDict<T>;
    private _prevStateDict: Readonly<Def.StateDict<T>>;
    protected baseStateDict: Def.StateDict<T>;
    get stateDict(): 
        Readonly<Def.StateDict<T>> &
        Readonly<Def.ParamDict<T>> {
        return { 
            ...this.baseStateDict,
            ...this._paramDict 
        };
    }
    private _onStateAlter(recursive?: boolean) {
        const prevState = {
            ...this._prevStateDict,
            ...this._paramDict
        };
        const nextParam = { ...this._baseParamDict };
        this._eventDict.onStateCheck(this, nextParam);
        this._paramDict = nextParam;
        this._prevStateDict = this.stateDict;
        this._eventDict.onStateAlter(this, prevState);
        if (recursive) {
            const childList: Model[] = [
                ...Object.values(this.childDict).filter(Boolean),
                ...this.childList
            ];
            for (const child of childList) child._onStateAlter();
        }
    }
    public useState(setter: Event<NodeEvent.OnStateAlter<T>>){
        this.bindEvent(this.eventEmitterDict.onStateAlter, setter);
        return () => {
            this.unbindEvent(this.eventEmitterDict.onStateAlter, setter);
        };
    }


    readonly uuid: string;
    private readonly _uuidDict: Record<string, Model> = {};
    get uuidList(): string[] {
        return (this.parent?.uuidList || []).concat(this.uuid);
    }
    queryChild(uuidList: string[]): Model | undefined {
        for (const uuid of uuidList) {
            const target = this._uuidDict[uuid];
            if (!target) continue;
            const index = uuidList.indexOf(uuid) + 1;
            return target.queryChild(uuidList.slice(index));
        }
        return undefined;
    }

    
    private readonly _loaderList: Base.Func[] = Lifecycle.getLoaderList(this);
    private readonly _unloaderList: Base.Func[] = Lifecycle.getUnloaderList(this);
    private _load() {
        for (const loader of this._loaderList) loader.call(this);
        const childList: Model[] = [
            ...Object.values(this.childDict).filter(Boolean),
            ...this.childList
        ];
        for (const child of childList) child._load();
    }
    private _unload() {
        for (const eventVector of this._eventVectorMap) {
            const eventEmitterOrHandler = eventVector[0];
            if (eventEmitterOrHandler instanceof Event.Emitter) {
                const [ eventEmitter, eventHandlerList ] = eventVector;
                for (const eventHandler of eventHandlerList) {
                    eventHandler.target.unbindEvent(
                        eventEmitter,
                        eventHandler.handler
                    );
                }
            }
            if (eventEmitterOrHandler instanceof Event.Handler) {
                const [ eventHandler ] = eventVector;
                this.unbindEvent(undefined, eventHandler.handler);
            }
        }
        const childList: Model[] = [
            ...Object.values(this.childDict).filter(Boolean),
            ...this.childList
        ];
        for (const child of childList) child._unload();
        for (const unloader of this._unloaderList) unloader.call(this);
        if (this.parent) {
            delete this.parent._uuidDict[this.uuid];
        }
    }

    
    get chunk(): Chunk<T> {
        const chunk: Chunk.Strict<T> =  {
            code: this.code,
            uuid: this.uuid,
            stateDict: { ...this.baseStateDict },
            childDict: { ...this._childChunkDict },
            childList: [ ...this._childChunkList ]
        };
        return chunk;
    }
}

