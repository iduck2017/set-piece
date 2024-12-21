import { FactoryService } from "@/set-piece/services/factory";
import { LifecycleService } from "@/set-piece/services/lifecycle";
import { Base, Dict, SuffixOf } from "@/set-piece/types/base";
import { Chunk, StrictChunk } from "@/set-piece/types/chunk";
import { Def } from "@/set-piece/types/define";
import { Event } from "@/set-piece/types/event";
import { Model } from "@/set-piece/types/model";
import { StrictProps } from "@/set-piece/types/props";
import { Delegator } from "@/set-piece/utils/proxy";
import { EventEmitter, EventHandler } from "./utils/event";
import { Mutable } from "utility-types";

export type NodeEvent<M extends Model> = {
    onStateAlter: NodeEvent.OnStateAlter<M>
    onParamCheck: NodeEvent.OnParamCheck<M>
    onChildSpawn: NodeEvent.OnChildSpawn<M>
}

export namespace NodeEvent {
    export type OnStateAlter<M extends Model> = [
        M, Readonly<Model.StateDict<M>>
    ]
    export type OnChildSpawn<M extends Model> = [M]
    export type OnParamCheck<M extends Model> = [M, Mutable<Model.ParamDict<M>>]
}

export abstract class NodeModel<T extends Def> {
    queryParent<T extends Model>(
        code?: SuffixOf<Model.Code<T>>,
        recursive?: boolean,
        validator?: ((model: Model) => boolean),
    ): T | undefined {
        let target: Model | undefined = this.parent;
        while (target) {
            const flag = 
                (!code || target.code.endsWith(code)) &&
                (!validator || validator(target));
            if (flag) {
                const result: any = target;
                return result;
            }
            if (recursive) {
                target = target.parent;
            } else return
        }
    }

    readonly code: Def.Code<T>;
    readonly parent: Def.Parent<T>;

    constructor(props: StrictProps<T>) {
        this.code = props.code;
        this.parent = props.parent;
        this.uuid = props.uuid || FactoryService.uuid;
        
        this.baseStateDict = Delegator.Observed(
            props.stateDict,
            this._onStateAlter.bind(this, false)
        );
        this._baseParamDict = props.paramDict;
        this._paramDict = { ...this._baseParamDict };
        this._prevStateDict = this.stateDict;

        this.eventEmitterDict = Delegator.Automic({}, (key) => {
            return new EventEmitter(this, key, props.eventInfo?.[key]);
        });

        const childList = Delegator.Observed(
            props.childList?.map(chunk => this._createChild(chunk)) || [],
            this._onChildSpawn.bind(this)
        );
        this.childList = Delegator.Readonly(childList);
        this.childChunkList = Delegator.Formatted(
            childList,
            (model) => model?.chunk,
            (chunk) => this._createChild(chunk) 
        );

        const origin: any = {};
        for (const key in props.childDict) {
            if (props.childDict[key]) {
                const child = this._createChild(props.childDict[key]);
                if (child) origin[key] = child;
            }
        }
        const childDict = Delegator.Observed(
            origin,
            this._onChildSpawn.bind(this)
        );
        this.childDict = Delegator.Readonly(childDict);
        this.childChunkDict = Delegator.Formatted(
            childDict,
            (model) => model?.chunk,
            (chunk) => this._createChild(chunk) 
        );
    }
    
    public debug() {
        console.log(
            this, 
            { ...this.stateDict }, 
            { ...this.childDict },
            [ ...this.childList ]
        );
    }

    readonly childList: Readonly<Def.ChildList<T>>;    
    readonly childDict: Readonly<Def.ChildDict<T>>;
    protected readonly childChunkDict: Chunk.Dict<Def.ChildDict<T>>;
    protected readonly childChunkList: Base.List<Model.Chunk<Def.ChildList<T>[number]>>;
    private _onChildSpawn(data: {
        prev?: Model | Model[],
        next?: Model | Model[]
    }) {
        const { prev, next } = data;
        if (next instanceof Array) next.map(target => target._load());
        if (prev instanceof Array) prev.map(target => target._unload());
        if (next instanceof NodeModel) next._load();
        if (prev instanceof NodeModel) prev._unload();
        this._baseEventDict.onChildSpawn(this);
    }
    useChild(setter: Event<NodeEvent.OnChildSpawn<typeof this>>){
        this.bindEvent(this.eventEmitterDict.onChildSpawn, setter);
        return () => {
            this.unbindEvent(this.eventEmitterDict.onChildSpawn, setter);
        };
    }
    protected appendChild(
        chunk: Model.Chunk<Def.ChildList<T>[number]>
    ): Def.ChildList<T>[number] | undefined {
        const uuid = chunk.uuid || FactoryService.uuid;
        this.childChunkList.push({
            ...chunk,
            uuid
        });
        for (const child of this.childList) {
            if (child.uuid === uuid) {
                return child;
            }
        }
        return undefined;
    }
    protected removeChild<C extends Def.ChildList<T>[number]>(
        target: C
    ): Model.Chunk<C> | undefined {
        const index = this.childList.indexOf(target);
        this.childChunkList.splice(index, 1);
        return target.chunk;
    }


    protected _createChild<M extends Model>(
        chunk: Model.Chunk<M>
    ): M | undefined {
        const Type = FactoryService.productDict[chunk.code];
        if (!Type) {
            console.error('[model-not-found]', { chunk });
            // throw new Error();
            return undefined;
        }
        const instance: M = new Type({
            ...chunk,
            parent: this
        });
        return instance;
    }

    protected eventDict: Readonly<Event.Dict<NodeEvent<typeof this> & Def.EventDict<T>>> = 
        Delegator.Automic({}, (key) => {
            return this._emitEvent.bind(this, key);
        });
    private readonly _baseEventDict: Readonly<Event.Dict<NodeEvent<typeof this>>> = this.eventDict;

    readonly eventEmitterDict: Readonly<Event.EmitterDict<NodeEvent<typeof this> & Def.EventDict<T>>>;
    private readonly _eventHandlerMap: Map<Base.Func, EventHandler> = new Map();
    private readonly _eventDependencyMap: 
        Map<EventEmitter, Base.List<EventHandler>> & 
        Map<EventHandler, Base.List<EventEmitter>> = new Map();

    private _emitEvent<K extends Dict.Key<NodeEvent<typeof this> & Def.EventDict<T>>>(
        key: K, 
        ...args: (NodeEvent<typeof this> & Def.EventDict<T>)[K]
    ) {
        const eventEmitterList = [
            this.eventEmitterDict[key],
            ...this.eventEmitterDict[key].alias
        ];
        for (const eventEmitter of eventEmitterList) {
            const { target } = eventEmitter;
            const eventHandlerList = target._eventDependencyMap.get(eventEmitter) || [];
            for (const eventHandler of eventHandlerList) {
                eventHandler.handler.call(eventHandler.target, ...args);
            }
        }
    }
    protected bindEvent<E extends Base.List>(
        eventEmitter: EventEmitter<E>,
        handler: Event<E>
    ) {
        const { target } = eventEmitter;
        const eventHandler = 
            this._eventHandlerMap.get(handler) || 
            new EventHandler(this, handler);
        this._eventHandlerMap.set(handler, eventHandler);

        const eventHandlerList = target._eventDependencyMap.get(eventEmitter) || [];
        eventHandlerList.push(eventHandler);
        target._eventDependencyMap.set(eventEmitter, eventHandlerList);

        const eventEmitterList = this._eventDependencyMap.get(eventHandler) || [];
        eventEmitterList.push(eventEmitter);
        this._eventDependencyMap.set(eventHandler, eventEmitterList);

        if (eventEmitter.key.endsWith('Check')) {
            target._onStateAlter(true);
        }
    }
    protected unbindEvent<E extends Base.List>(
        eventEmitter: EventEmitter<E> | undefined,
        handler: Event<E>
    ) {
        const eventHandler = this._eventHandlerMap.get(handler);
        if (eventHandler) {
            const eventEmitterList = this._eventDependencyMap.get(eventHandler) || [];
            for (const curEventEmitter of eventEmitterList) {
                if (eventEmitter && curEventEmitter !== eventEmitter) continue;
                const { target } = curEventEmitter;
                const eventHandlerList = target._eventDependencyMap.get(curEventEmitter) || [];
                target._eventDependencyMap.set(
                    curEventEmitter, 
                    eventHandlerList.filter(target => target !== eventHandler)
                );
                if (curEventEmitter.key.endsWith('Check')) {
                    target._onStateAlter(true);
                }
            }
            this._eventDependencyMap.delete(eventHandler);
            this._eventHandlerMap.delete(handler);
        }
    }
    

    private readonly _baseParamDict: Def.ParamDict<T>;
    private _paramDict: Def.ParamDict<T>;
    private _prevStateDict: Readonly<Def.StateDict<T>>;
    protected baseStateDict: Def.StateDict<T>;
    get paramDict(): Readonly<Def.ParamDict<T>> {
        return { ...this._paramDict };
    }
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
        this._baseEventDict.onParamCheck(this, nextParam);
        this._paramDict = nextParam;
        this._prevStateDict = this.stateDict;
        this._baseEventDict.onStateAlter(this, prevState);
        if (recursive) {
            const childList: Model[] = [
                ...Object.values(this.childDict).filter(Boolean),
                ...this.childList
            ];
            for (const child of childList) child._onStateAlter();
        }
    }
    public useState(setter: Event<NodeEvent.OnStateAlter<typeof this>>){
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

    
    private readonly _loaderList: Base.Func[] = LifecycleService.getLoaderList(this);
    private readonly _unloaderList: Base.Func[] = LifecycleService.getUnloaderList(this);
    private _load() {
        for (const loader of this._loaderList) loader.call(this);
        const childList: Model[] = [
            ...Object.values(this.childDict).filter(Boolean),
            ...this.childList
        ];
        for (const child of childList) child._load();
    }
    private _unload() {
        for (const eventDependency of this._eventDependencyMap) {
            const eventEmitterOrHandler = eventDependency[0];
            if (eventEmitterOrHandler instanceof EventEmitter) {
                const [ eventEmitter, eventHandlerList ] = eventDependency;
                for (const eventHandler of eventHandlerList) {
                    eventHandler.target.unbindEvent(
                        eventEmitter,
                        eventHandler.handler
                    );
                }
            }
            if (eventEmitterOrHandler instanceof EventHandler) {
                const [ eventHandler ] = eventDependency;
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
        const chunk: StrictChunk<T> =  {
            code: this.code,
            uuid: this.uuid,
            stateDict: { ...this.baseStateDict },
            childDict: { ...this.childChunkDict },
            childList: [ ...this.childChunkList ]
        };
        return chunk;
    }
}

