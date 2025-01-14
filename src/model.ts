import { Event, childUpdateEvent, StateUpdateEvent } from "./event";
import { KeyOf, Value } from "./types";
import { FactoryService } from "@/services/factory";

type Constructor<T> = new (...args: any[]) => T;
type EventHandler<E = any> = (event: E) => void
type StateHandler<S = any> = (state: S) => S
type Strict<T> = T & { _never?: never }

export class Model<
    S extends Record<string, Value> = {},
    E extends Record<string, Event> = {},
    C extends Record<string, Model> | Model[] = any,
    P extends Model | undefined = any,
> {
    constructor(props: Readonly<{
        uuid?: string,
        state: Strict<Readonly<S>>,
        child: Strict<Readonly<C>>
    }>) {

        this.uuid = props.uuid || FactoryService.uuid;

        this.stateProxy = new Proxy(props.state, {
            get: (origin, key) => {
                if (!this._isStateReset) return Reflect.get(origin, key);
                return Reflect.get(this._stateDraft, key);
            },
            set: (origin, key, value) => {
                Reflect.set(origin, key, value);
                this.resetState();
                return true;
            },
            deleteProperty: (origin, key) => {
                Reflect.deleteProperty(origin, key);
                this.resetState();
                return true;
            }
        })

        // Init state cache
        this._stateDraft = { ...this.stateProxy }
        this._stateCache = { ...this.stateProxy }

        // Precheck child
        const childOrigin: any = props.child instanceof Array ? [] : {};
        for (const key of Object.keys(props.child)) {
            const value = Reflect.get(props.child, key);
            if (value instanceof Model) {
                const model = value._isReserved ? value.copy() : value;
                Reflect.set(childOrigin, key, model);
                model._isReserved = true;
            }
        }

        // delegate child, observe update
        this.childProxy = new Proxy(childOrigin, {
            get: (origin, key: string) => {
                // delegate all array methods with side effects
                const value = Reflect.get(origin, key);
                if (typeof key === 'string' && typeof value === 'function') {
                    return (...args: any[]) => {
                        const handler = Reflect.get(origin, key);
                        const result = handler.call(origin, ...args);
                        this.resetChild();
                        return result;
                    }
                }
                if (!this._isChildReset) return Reflect.get(origin, key);
                return Reflect.get(this._childCache, key);
            },
            set: (origin, key, value) => {
                Reflect.set(origin, key, value);
                this.resetChild();
                return true;
            },
            deleteProperty: (target, key) => {
                Reflect.deleteProperty(target, key);
                this.resetChild();
                return true;
            }
        })
        
        this._childCache = this._copyChild(this.childProxy);
        
        this._isStateReset = true;
        this._isChildReset = true;
    }

    debug() {
        console.log(this.name);
        console.log(this.state);
        console.log(this.child);
        console.log(this._eventChannels);
    }

    /**
     * Observe state and child update
     * @feature debug
     * @param setter 
     * @returns 
     */
    useModel(setter: EventHandler<{ target: Model }>) {
        this.bindEvent(this.event.onChildUpdate, setter);
        this.bindEvent(this.event.onStateUpdate, setter);
        return () => {
            this.unbindEvent(this.event.onChildUpdate, setter);
            this.unbindEvent(this.event.onStateUpdate, setter);
        }
    }
    
    /**
     * Get props, also used as constructor parameters
     * @feature factory
     * @returns props
     * @returns props.uuid - unique id
     * @returns props.state - state
     * @returns props.child - child
     */
    get props(): Readonly<{
        uuid?: string,
        state?: Strict<Readonly<Partial<S>>>,
        child?: C extends any[] ? Readonly<C> : Readonly<Readonly<Partial<C>>>
    }> {
        return {
            uuid: this.uuid,
            child: this.child,
            state: { ...this._stateDraft },
        }
    }

    /**
     * Create a duplication of current model
     * @feature factory
     * @param uuid - unique id, auto generate if not provided
     * @returns cloned model
     */
    copy(uuid?: string): this {
        const constructor: any = this.constructor;
        const props = this.props;
        return new constructor({
            ...props,
            uuid,
        })
    }

    /**
     * Declare model as root, it will be initialized immediately
     * @decorator
     * @feature factory
     */
    private static _root: Constructor<Model>;
    protected static asRoot<T extends Constructor<Model>>() {
        return function (constructor: T): T {
            Model._root = constructor;
            return class extends constructor {
                constructor(...args: any[]) {
                    super(...args);
                    if (Model._root !== constructor) return;
                    this._init();
                }
            }
        };
    }


    /**
     * Delegate event
     * @proxy
     * @feature event
     */
    readonly event: E & {
        onChildUpdate: childUpdateEvent<S, C>
        onStateUpdate: StateUpdateEvent<S>
    } = new Proxy({} as any, {
        deleteProperty: () => false,
        set: () => false,
        get: (target, key: string) => {
            if (!Reflect.has(target, key)) {
                const event = new Event(this);
                Reflect.set(target, key, event);
                this._eventProducers.set(event, key);
            }
            return Reflect.get(target, key)
        }
    })
    private readonly _eventHandlers = new Map<Event, EventHandler>()
    private readonly _eventProducers = new Map<Event, string>()
    private readonly _eventConsumers = new Map<EventHandler, Event>()
    private readonly _eventChannels = new Map<Event, Event[]>()

    /**
     * Emit event
     * @feature event
     * @param producer - event producer
     * @param event - event
     */
    protected emitEvent<E>(producer: Event<E>, event: E) {
        if (!this._isInited) return;
        const consumers = this._eventChannels.get(producer) || [];
        for (const consumer of consumers) {
            const { target } = consumer;
            const handler = target._eventHandlers.get(consumer);
            if (handler) handler.call(target, event);
            else console.warn('Event handler not found');
        }
    }
    
    protected bindEvent<E>(
        producer: Event<E>, 
        handler: EventHandler<E>,
    ) {
        if (!this._isInited && !this._isIniting) return;
        const { target } = producer;

        const consumer = this._eventConsumers.get(handler) ?? new Event(this);
        this._eventConsumers.set(handler, consumer);
        this._eventHandlers.set(consumer, handler);

        const consumers = target._eventChannels.get(producer) || [];
        consumers.push(consumer);
        target._eventChannels.set(producer, consumers);

        const producers = this._eventChannels.get(consumer) || [];
        producers.push(producer);
        this._eventChannels.set(consumer, producers);
    }

    protected unbindEvent<E>(
        producer: Event<E> | undefined,
        handler: EventHandler<E>,
    ) {
        if (!this._isInited && !this._isIniting) return;
        const consumer = this._eventConsumers.get(handler);
        if (!consumer) return;

        const producers = this._eventChannels.get(consumer) || [];
        for (const curProducer of [...producers]) {
            if (producer && curProducer !== producer) continue;
            
            const { target } = curProducer;
            
            let consumers = target._eventChannels.get(curProducer) || [];
            consumers = consumers.filter(target => target !== consumer);
            target._eventChannels.set(curProducer, consumers);

            const index = producers.indexOf(curProducer);
            if (index !== -1) producers.splice(index, 1);
        }

        this._eventChannels.set(consumer, producers);
    }


    /** @feature state */
    get state(): Readonly<S> {
        return { ...this._stateCache }
    }
    private _stateDraft: Readonly<S>
    private _stateCache: Readonly<S>
    protected readonly stateProxy: S

    private _stateHandlers: Map<Event, StateHandler> & Map<StateHandler, Event> = new Map()
    private _stateChannels: Map<Model, Event[]> & Map<Event, Model[]> = new Map()

    private static _decorKeys: Map<Constructor<Model>, string[]> = new Map();
    protected static useDecor<T extends Model>(
        state: Partial<Record<KeyOf<T['state']>, boolean>>
    ) {
        return function (constructor: Constructor<T>) {
            Model._decorKeys.set(constructor, Object.keys(state));
        };
    }

    protected bindDecor<M extends Model>(
        target: M,
        handler: StateHandler<M['state']>,
        uuid?: string,  
        lane?: number,
    ) {
        if (!this._isInited && !this._isIniting) return;
        if (!uuid) uuid = FactoryService.uuid;
        if (!lane) lane = 0;

        const consumer = this._stateHandlers.get(handler) ?? new Event(this);
        this._stateHandlers.set(consumer, handler);
        this._stateHandlers.set(handler, consumer);

        const models = this._stateChannels.get(consumer) || [];
        models.push(target);
        this._stateChannels.set(consumer, models);

        const consumers = target._stateChannels.get(target) || [];
        consumers.push(consumer);
        target._stateChannels.set(target, consumers);
        target.resetState()
    }

    
    protected unbindDecor<M extends Model>(
        target: M | undefined,
        handler: StateHandler<M['state']>,
    ) {
        const consumer = this._stateHandlers.get(handler);
        if (!consumer) return;

        const models = this._stateChannels.get(consumer) || [];
        for (const curModel of [...models]) {
            if (target && curModel !== target) continue;
            
            let consumers = curModel._stateChannels.get(curModel) || [];
            consumers = consumers.filter(target => target !== consumer);
            curModel._stateChannels.set(curModel, consumers);
            curModel.resetState();

            const index = models.indexOf(curModel);
            if (index !== -1) models.splice(index, 1);
        }

        this._stateChannels.set(consumer, models);
    }

    private _emitDecor() {
        if (!this._isInited) return;

        const decorKeys = [];
        let constructor: any = this.constructor;
        while (constructor.__proto__ !== null) {
            if (Model._decorKeys.has(constructor)) {
                decorKeys.push(...Model._decorKeys.get(constructor) || []);
            }
            constructor = constructor.__proto__;
        }
        if (!decorKeys.length) return;


        let stateDraft = { ...this.stateProxy };
        const consumers = this._stateChannels.get(this) || [];
        consumers.sort((a, b) => {
            if (a.lane !== b.lane) return a.lane - b.lane;
            return a.uuid > b.uuid ? 1 : -1;
        });

        for (const consumer of [...consumers]) {
            const { target } = consumer;
            const handler = target._stateHandlers.get(consumer);
            if (!handler) continue;
            stateDraft = handler(stateDraft);
        }

        const stateCache = { ...this.stateProxy };
        for (const key of decorKeys) {
            Reflect.set(stateCache, key, Reflect.get(stateDraft, key));
        }

        this._stateCache = stateCache;
    }


    resetState() {
        if (this._isAutomic) return;

        this._isStateReset = false;
        
        const statePrev = this.state;

        this._stateDraft = { ...this.stateProxy };
        this._stateCache = { ...this.stateProxy };

        this._emitDecor();

        const stateNext = this.state;
        this._isStateReset = true;
        
        this.emitEvent(this.event.onStateUpdate, { 
            target: this, 
            statePrev,
            stateNext
        });
    }

    /**
     * Parent node, specified in initialization
     * For root node, there is no parent
     * @feature parent
     */
    private _parent?: P
    public get parent() { return this._parent; }

    protected queryParent<T extends Model>(type: Constructor<T>): T | undefined {
        let target: Model | undefined = this.parent;
        while (target) {
            if (target instanceof type) return target;
            target = target.parent;
        }
        return undefined;
    }


    

    /**
     * Child accesser
     * @feature child
     */
    get child(): C extends any[] ? Readonly<C> : Readonly<C> { 
        return this._copyChild(this._childCache) 
    }
    private _childCache: Readonly<C>
    protected readonly childProxy: C
    private readonly _childRefer: Record<string, Model> = {}

    private _copyChild(origin: C): C extends any[] ? Readonly<C> : Readonly<C> {
        const child: any = origin instanceof Array ? [] : {};
        for (const key of Object.keys(origin)) {
            const value = Reflect.get(origin, key);
            if (value instanceof Model) {
                Reflect.set(child, key, value);
            }
        }
        return child;
    }

    private _listChild(child: C): Model[] {
        const list: Model[] = [];
        for (const key of Object.keys(child)) {
            const value = Reflect.get(child, key);
            if (value instanceof Model) list.push(value);
        }
        return list;
    }

    protected removeChild(model?: Model): Model | undefined {
        if (!model) return;
        if (this.childProxy instanceof Array) {
            const index = this.childProxy.indexOf(model);
            if (index === -1) return;
            this.childProxy.splice(index, 1);
            return model;
        } else {
            for (const key of Object.keys(this.childProxy)) {
                const value = Reflect.get(this.childProxy, key);
                if (value !== model) continue;
                Reflect.deleteProperty(this.childProxy, key);
                return model;
            }
        }
    }

    /**
     * Operate child in transaction, reset child at the end
     * @decorator
     * @feature lifecycle, child
     */
    protected static useAutomic() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
        ) {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            descriptor.value = function(this: Model, ...args: any[]) {
                if (this._isAutomic) return handler.apply(this, args);
                this._isAutomic = true;
                const result = handler.apply(this, args);
                this._isAutomic = false;
                this.resetState();
                this.resetChild();
                return result;
            }
            return descriptor;
        }
    }

    /**
     * Reset child
     * @feature lifecycle
     */
    resetChild() {
        if (this._isAutomic) return;
        if (!this._isChildReset) return;

        this._isChildReset = false;
        this._precheckChild();
        const childPrev = this.child;
        this._childCache = this._copyChild(this.childProxy);
        const childNext = this.child;
        this._isChildReset = true;
        
        this.emitEvent(this.event.onChildUpdate, { 
            target: this, 
            childPrev,
            childNext
        })
    }

    private _precheckChild() {
        // Replace all invalid models with copies
        for (const key in Object.keys(this.childProxy)) {
            const value = Reflect.get(this.childProxy, key);
            if (!(value instanceof Model)) continue;
            const model = value._isReserved ? value.copy() : value;
            Reflect.set(this.childProxy, key, model);
            model._isReserved = true;
        }
        
        const childNext = this._listChild(this.childProxy);
        const childPrev = this._listChild(this.child);
        const childAdd = childNext.filter(child => !childPrev.includes(child));
        const childDel = childPrev.filter(child => !childNext.includes(child));

        if (!this._isIniting && !this._isInited) return;
        for (const child of childAdd) child._init(this);
        for (const child of childDel) child._uninit();
    }

    

    /**
     * child is initializing in transaction
     * @feature lifecycle
     */
    private _isAutomic = false;
    private _isReserved = false;
    private _isInited = false;
    private _isIniting = false;
    private _isStateReset = false;
    private _isChildReset = false;

    private static readonly _hooksInit = new Map<Function, string[]>()
    private static readonly _hooksChildInit = new Map<Function, string[]>()

    private _init(parent?: P) {
        if (this._isInited) return;
        if (this._isIniting) return;

        this._isIniting = true;

        if (parent) {
            this._parent = parent;
            this._parent._childRefer[this.uuid] = this;
        }

        // Initialize child first
        for (const child of this._listChild(this.childProxy)) {
            child._init(this);
        }

        // Trigger child init hooks of all ancestor nodes
        let ancestor: Model | undefined = this._parent;
        while (ancestor) {
            let constructor: any = ancestor.constructor;
            while (constructor.__proto__ !== null) {
                const keys = Model._hooksChildInit.get(constructor) || [];
                for (const key of keys) {
                    const initer = Reflect.get(ancestor, key);
                    if (typeof initer === 'function') initer.call(ancestor, this);
                }
                constructor = constructor.__proto__;
            }
            ancestor = ancestor.parent;
        }

        // Trigger init hooks
        let constructor: any = this.constructor;
        while (constructor.__proto__ !== null) {
            const keys = Model._hooksInit.get(constructor) || [];
            for (const key of keys) {
                const initer = Reflect.get(this, key);
                if (typeof initer === 'function') initer.call(this);
            }
            constructor = constructor.__proto__;
        }
        
        this._isIniting = false;
        this._isInited = true;

        this.resetState();
    }


    /**
     * Uninitialize model, it will uninitialize all child nodes and clear all event bindings
     * @feature lifecycle
     */
    private _uninit() {
        if (!this._isInited) return;
        if (this._isIniting) return;

        this._isIniting = true;

        // Uninitialize child first
        for (const child of this._listChild(this.childProxy)) {
            child._uninit();
        }

        // Unbind all event
        for (const channel of this._eventChannels) {
            const entity = channel[0];

            // Unbind all event consumer
            const handler = this._eventHandlers.get(entity);
            if (handler) this.unbindEvent(undefined, handler)
                
            // Unbind all event producer
            else if (this._eventProducers.has(entity)) {
                const [ producer, consumers ] = channel;
                consumers.forEach(consumer => {
                    const handler = consumer.target._eventHandlers.get(consumer);
                    if (!handler) return;
                    consumer.target.unbindEvent(producer, handler)
                });
            }
        }

        // Unbind all decor
        for (const channel of this._stateChannels) {
            const entity = channel[0];
            if (entity instanceof Model) {
                const consumers = channel[1];
                for (const consumer of consumers) {
                    const target = consumer.target;
                    const handler = target._stateHandlers.get(consumer);
                    if (!handler) continue;
                    target.unbindDecor(this, handler);
                }
            } else {
                const handler = this._stateHandlers.get(entity);
                if (handler) this.unbindDecor(this, handler);
            }
        }
        
        const parent = this._parent;
        if (parent) {
            this._parent = undefined;
            parent._childRefer[this.uuid] = this;
        }

        this._isIniting = false;
        this._isInited = false;
    }

    /**
     * Get constructor name
     * Sometimes, the constructor is anonymous, access the name from the prototype chain
     * @feature factory
     */
    get name() {
        let constructor: any = this.constructor;
        while (constructor.__proto__ !== null) {
            if (constructor.name) return constructor.name;
            constructor = constructor.__proto__;
        }
        return constructor.name;
    }


    /**
     * Unique id of model
     * @feature uuid
     */
    readonly uuid: string;

    /**
     * Accessor the path from the root node to the current model
     * If the model is not initialized, it will only return it's uuid
     * @feature uuid
     * @returns path
     */
    get path(): string[] | undefined {
        if (!this._isInited || this._isIniting) return undefined;
        const result: string[] = [];
        let ancestor: Model | undefined = this;
        while (ancestor) {
            result.push(ancestor.uuid);
            ancestor = ancestor.parent;
        }
        return result;
    }

    /**
     * Query child by path
     * @feature uuid
     * @param path - path
     * @returns child
     */
    queryChild(path: string[] | string): Model | undefined {
        if (typeof path === 'string') return this._childRefer[path];
        for (const uuid of path) {
            const target = this._childRefer[uuid];
            if (!target) continue;
            const index = path.indexOf(uuid) + 1;
            return target.queryChild(path.slice(index));
        }
        return undefined;
    }

    /**
     * Trigger when the model is initialized
     * @decorator
     * @feature lifecycle
    */
    static onInit() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<() => unknown>
        ): TypedPropertyDescriptor<() => unknown> {
            const keys = Model._hooksInit.get(target.constructor) || [];
            keys.push(key);
            Model._hooksInit.set(target.constructor, keys);
            return descriptor;
        };
    }


    /**
     * Trigger when the model's descendant node is initialized
     * @decorator
     * @feature lifecycle
     */
    static onChildInit() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<(child: Model) => unknown>
        ): TypedPropertyDescriptor<(child: Model) => unknown> {
            const keys = Model._hooksChildInit.get(target.constructor) || [];
            keys.push(key);
            Model._hooksChildInit.set(target.constructor, keys);
            return descriptor;
        };
    }
}


