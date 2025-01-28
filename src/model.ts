import { Event, ChildUpdateEvent, StateUpdateEvent } from "./types";
import { Value } from "./types";
import { FactoryService } from "@/services/factory";

type EventHandler<E = any> = (event: E) => void
type StateHandler<S = any> = (state: S) => S
type Strict<T> = T & { _never?: never }
type Callback<T = any, P extends any[] = any[]> = (...args: P) => T
type Constructor<T> = new (...args: any[]) => T
type KeyOf<T> = keyof T & string

export enum ModelStatus {
    INITED,
    LOADING,
    LOADED,
    UNLOADING,
}

export class Model<
    S extends Record<string, Value> = {},
    E extends Record<string, Event> = {},
    C extends Record<string, Model> | Model[] = any,
    P extends Model | undefined = any | undefined,
> {
    private get _constructor(): typeof Model {
        const constructor: any = this.constructor;
        return constructor;
    }
    
    constructor(props: Readonly<{
        uuid?: string,
        state: Strict<Readonly<S>>,
        child: Strict<Readonly<C>>
    }>) {
        this.uuid = props.uuid || FactoryService.uuid;

        this._stateDraft = { ...props.state }
        this._stateCache = { ...props.state }
        this._state = { ...props.state }
        
        const child = this._prepareChild(props.child);
        this._childDraft = this._copyChild(child);
        this._child = this._copyChild(child);
        this.childProxy = new Proxy(this._childDraft, {
            deleteProperty: this._deleteChild.bind(this),
            set: this._setChild.bind(this),
            get: (origin, key: string) => {
                const value = Reflect.get(this._child, key);
                if (!(this._childDraft instanceof Array)) return value;
                if (typeof value !== 'function') return value;
                if (key === 'push') return this._delegateChild.bind(this, key);
                if (key === 'pop') return this._delegateChild.bind(this, key);
                if (key === 'shift') return this._delegateChild.bind(this, key);
                if (key === 'unshift') return this._delegateChild.bind(this, key);
                if (key === 'splice') return this._delegateChild.bind(this, key);
                if (key === 'sort') return this._delegateChild.bind(this, key);
                if (key === 'reverse') return this._delegateChild.bind(this, key);
                if (key === 'fill') return this._delegateChild.bind(this, key);
                return this._observeChild.bind(this, key);
            }
        })

        if (this._constructor._isRoot) {
            const parent: any = undefined;
            this._isOrdered = true;
            this._load(parent);
        }
    }


    private _prepareChild(child: Strict<Readonly<C>>) {
        const origin: any = child instanceof Array ? [] : {};
        for (const key of Object.keys(child)) {
            const value = Reflect.get(child, key);
            if (!(value instanceof Model)) continue;
            const model = value._isOrdered ? value.copy() : value;
            Reflect.set(origin, key, model);
            model._isOrdered = true;
        }
        return origin;
    }

    @Model.useAutomic()
    @Model.useLogger()
    protected setState(handler: (prev: S) => S) {
        const stateNext = handler(this._stateDraft);
        this._stateDraft = { ...stateNext };
    }

    @Model.useAutomic()
    @Model.useLogger()
    private _setState(origin: S, key: string, value: Value) {
        Reflect.set(this._stateDraft, key, value);
        return true;
    }
    
    @Model.useAutomic()
    @Model.useLogger()
    private _deleteState(origin: S, key: KeyOf<S>) {
        Reflect.deleteProperty(this._stateDraft, key);
        return true;
    }

    @Model.useAutomic()
    @Model.useLogger()
    private _setChild(origin: C, key: KeyOf<C>, value: Model) {
        Reflect.set(this._childDraft, key, value);
        return true;
    }

    @Model.useAutomic()
    @Model.useLogger()
    private _deleteChild(origin: C, key: KeyOf<C>) {
        Reflect.deleteProperty(this._childDraft, key);
        return true;
    }

    @Model.useAutomic()
    @Model.useLogger()
    private _delegateChild(key: string, ...args: any[]) {
        const handler = Reflect.get(this._childDraft, key);
        if (typeof handler !== 'function') return;
        return handler.call(this._childDraft, ...args);
    }

    @Model.useLogger()
    private _observeChild(key: string, ...args: any[]) {
        const handler = Reflect.get(this._child, key);
        if (typeof handler !== 'function') return;
        return handler.call(this._child, ...args);
    }

    debug() {
        console.log(this.constructor.name);
        console.log(this._isOrdered)
        console.log(this._constructor._hooksChildLoad)
        // console.log(this.state);
        // console.log(this.child);
    }

    // @Model.useLogger()
    useModel(setter: EventHandler<{ target: Model }>) {
        this.bindEvent(this.event.onChildUpdate, setter);
        this.bindEvent(this.event.onStateUpdate, setter);
        return () => {
            this.unbindEvent(this.event.onChildUpdate, setter);
            this.unbindEvent(this.event.onStateUpdate, setter);
        }
    }
    
    get props(): Readonly<{
        uuid?: string,
        state?: Strict<Readonly<Partial<S>>>,
        child?: C extends any[] ? Readonly<C> : Strict<Readonly<Partial<C>>>
    }> {
        return {
            uuid: this.uuid,
            child: this.child,
            state: { ...this._stateCache },
        }
    }

    @Model.useLogger()
    copy(uuid?: string): this {
        const constructor: any = this.constructor;
        const props = this.props;
        return new constructor({
            ...props,
            uuid,
        })
    }

    private static _isRoot: boolean = false;
    protected static useRoot() {
        return function (constructor: Constructor<Model>) {
            const model: Model = constructor.prototype;
            model._constructor._isRoot = true;
        };
    }

    private get _root(): Model | undefined {
        let root: Model | undefined = this;
        while (root?.parent) root = root.parent;
        return root;
    }

    readonly event: E & {
        onChildUpdate: ChildUpdateEvent<S, C>
        onStateUpdate: StateUpdateEvent<S>
    } = new Proxy({} as any, {
        deleteProperty: () => false,
        set: () => false,
        get: (target, key: string) => {
            const event = new Event(this);
            if (!Reflect.has(target, key)) Reflect.set(target, key, event);
            return Reflect.get(target, key);
        }
    })

    private readonly _eventHandlersByConsumer = new Map<Event, EventHandler>()
    private readonly _eventConsumersByHandler = new Map<EventHandler, Event>()
    private readonly _eventConsumersByProducer = new Map<Event, Event[]>()
    private readonly _eventProducersByConsumer = new Map<Event, Event[]>()

    @Model.ifStatus(ModelStatus.LOADED)
    @Model.useLogger()
    protected emitEvent<E>(producer: Event<E>, event: E) {
        const _consumers = this._eventConsumersByProducer.get(producer) || [];
        const consumers = [..._consumers];
        consumers.sort((a, b) => a.target.uuid > b.target.uuid ? 1 : -1);

        for (const consumer of consumers) {
            const { target } = consumer;
            const handler = target._eventHandlersByConsumer.get(consumer);
            if (handler) handler.call(target, event);
            else console.warn('Event handler not found');
        }
    }
    

    @Model.ifStatus(ModelStatus.LOADED, ModelStatus.LOADING)
    // @Model.useLogger()
    protected bindEvent<E>(
        producer: Event<E>, 
        handler: EventHandler<E>,
    ) {
        const { target } = producer;
        if (target._root !== this._root) return;

        const consumer = this._eventConsumersByHandler.get(handler) ?? new Event(this);
        this._eventConsumersByHandler.set(handler, consumer);
        this._eventHandlersByConsumer.set(consumer, handler);

        const consumers = target._eventConsumersByProducer.get(producer) || [];
        consumers.push(consumer);
        target._eventConsumersByProducer.set(producer, consumers);

        const producers = this._eventProducersByConsumer.get(consumer) || [];
        producers.push(producer);
        this._eventProducersByConsumer.set(consumer, producers);
    }

    @Model.ifStatus(ModelStatus.LOADED, ModelStatus.UNLOADING)
    // @Model.useLogger()
    protected unbindEvent<E>(
        producer: Event<E> | undefined,
        handler: EventHandler<E>,
    ) {
        const consumer = this._eventConsumersByHandler.get(handler);
        if (!consumer) return;

        const producers = this._eventProducersByConsumer.get(consumer) || [];
        for (const _producer of [...producers]) {
            if (producer && _producer !== producer) continue;
            
            const { target } = _producer;
            let consumers = target._eventConsumersByProducer.get(_producer) || [];
            consumers = consumers.filter(target => target !== consumer);
            target._eventConsumersByProducer.set(_producer, consumers);

            const index = producers.indexOf(_producer);
            if (index !== -1) producers.splice(index, 1);
        }

        this._eventProducersByConsumer.set(consumer, producers);
    }


    get state(): Readonly<S> {
        return { ...this._state }
    }
    private _stateDraft: Readonly<S>
    private _stateCache: Readonly<S>
    private _state: Readonly<S>
    protected readonly stateProxy: S = new Proxy({} as any, {
        deleteProperty: this._deleteState.bind(this),
        set: this._setState.bind(this),
        get: (origin, key) => Reflect.get(this._stateCache, key)
    })

    private _stateModifiersByHandler = new Map<StateHandler, Event>()
    private _stateHandlersByModifier = new Map<Event, StateHandler>()
    private _stateModifiers: Event[] = [];
    private _stateProducersByModifier = new Map<Event, Model[]>()

    private static _isModifiable: boolean = false;
    protected static useModifier() {
        return function (constructor: Constructor<Model>) {
            const model: Model = constructor.prototype;
            model._constructor._isModifiable = true;
        };
    }

    protected static ifModifiable<R>(flag: boolean) {
        return function (
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback<R | undefined>>
        ): TypedPropertyDescriptor<Callback<R | undefined>> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            descriptor.value = function(this: Model, ...args: any[]) {
                if (this._constructor._isModifiable !== Boolean(flag)) return;
                return handler.call(this, ...args);
            }
            return descriptor;
        };
    }

    @Model.ifStatus(ModelStatus.LOADED, ModelStatus.LOADING)
    @Model.useLogger()
    protected bindState<S extends Record<string, Value>>(
        target: Model<S>,
        handler: StateHandler<S>
    ) {
        if (target._root !== this._root) return

        const modifier = this._stateModifiersByHandler.get(handler) ?? new Event(this);
        this._stateHandlersByModifier.set(modifier, handler);
        this._stateModifiersByHandler.set(handler, modifier);

        const producers = this._stateProducersByModifier.get(modifier) || [];
        producers.push(target);
        this._stateProducersByModifier.set(modifier, producers);

        target._stateModifiers.push(modifier);
        target.reloadState()
    }

    @Model.ifStatus(ModelStatus.LOADED, ModelStatus.UNLOADING)
    @Model.useLogger()
    protected unbindState<S extends Record<string, Value>>(
        target: Model<S> | undefined,
        handler: StateHandler<S>,
    ) {
        const modifier = this._stateModifiersByHandler.get(handler);
        if (!modifier) return;

        const producers = this._stateProducersByModifier.get(modifier) || [];
        for (const _producer of [...producers]) {
            if (target && _producer !== target) continue;
            
            let modifiers = _producer._stateModifiers;
            const modifierIndex = modifiers.indexOf(modifier);
            if (modifierIndex === -1) continue;
            modifiers.splice(modifierIndex, 1);
            
            _producer.reloadState();

            const producerIndex = producers.indexOf(_producer);
            if (producerIndex !== -1) producers.splice(producerIndex, 1);
        }

        this._stateProducersByModifier.set(modifier, producers);
    }

    @Model.ifStatus(ModelStatus.LOADED)
    @Model.ifModifiable(true)
    @Model.useLogger()
    private _modifyState(): S | undefined {
        let stateDraft = { ...this._stateDraft };
        const modifiers = [ ...this._stateModifiers ];
        modifiers.sort((a, b) => a.target.uuid > b.target.uuid ? 1 : -1);

        for (const modifier of modifiers) {
            const { target } = modifier;
            const handler = target._stateHandlersByModifier.get(modifier);
            if (!handler) continue;
            stateDraft = handler(stateDraft);
        }
        return stateDraft;
    }

    @Model.ifAutomic(false)
    @Model.useLogger()
    reloadState() {
        const statePrev = this.state;
        this._state = this._modifyState() || { ...this._stateDraft };
        this._stateCache = { ...this._stateDraft };
        const stateNext = this.state;
        this.emitEvent(this.event.onStateUpdate, { 
            target: this, 
            statePrev,
            stateNext
        });
    }

    private _parent?: P
    public get parent() { return this._parent; }

    get child(): C extends any[] ? Readonly<C> : Readonly<C> { 
        return this._copyChild(this._child) 
    }
    private readonly _childDraft: Readonly<C>
    private _child: Readonly<C>
    protected readonly childProxy: C
    private readonly _childByUuid: Record<string, Model> = {}

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

    @Model.useAutomic()
    @Model.useLogger()
    protected removeChild(model?: Model): Model | undefined {
        if (!model) return;
        if (this.childProxy instanceof Array) {
            const index = this.childProxy.indexOf(model);
            if (index === -1) return;
            this.childProxy.splice(index, 1);
            return model;
        } 
        for (const key of Object.keys(this.childProxy)) {
            const value = Reflect.get(this.childProxy, key);
            if (value !== model) continue;
            Reflect.deleteProperty(this.childProxy, key);
            return model;
        }
        return
    }

    protected static useAutomic() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<(...args: any[]) => any>
        ) {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Model, ...args: any[]) {
                    if (this._isAutomic) return handler.apply(this, args);
                    this._isAutomic = true;
                    console.log('Automic+ ============')
                    const result = handler.apply(this, args);
                    console.log('Automic- ============')
                    this._isAutomic = false;
                    this.reloadState();
                    this.reloadChild();
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

    @Model.ifAutomic(false)
    @Model.useLogger()
    reloadChild() {
        this._precheckChild();
        const childPrev = this.child;
        const childNext = this._copyChild(this._childDraft);

        this._unloadChild(childPrev, childNext);
        this._child = this._copyChild(this._childDraft);
        this._loadChild(childPrev, childNext);

        this.emitEvent(this.event.onChildUpdate, { 
            target: this, 
            childPrev,
            childNext
        })
    }

    @Model.ifStatus(ModelStatus.LOADED)
    @Model.useLogger()
    private _loadChild(
        childPrev: Readonly<C>,
        childNext: Readonly<C>,
    ) {
        const _childPrev = this._listChild(childPrev)
        const _childNext = this._listChild(childNext)
        const childAdd = _childNext.filter(child => !_childPrev.includes(child));
        for (const child of childAdd) child._load(this);
    }

    @Model.ifStatus(ModelStatus.LOADED)
    @Model.useLogger()
    private _unloadChild(
        childPrev: Readonly<C>,
        childNext: Readonly<C>,
    ) {
        const _childPrev = this._listChild(childPrev)
        const _childNext = this._listChild(childNext)
        const childDel = _childPrev.filter(child => !_childNext.includes(child));
        for (const child of childDel) child._unload();
    }

    @Model.useLogger()
    private _precheckChild() {
        const childPrev = this._listChild(this.child);
        for (const key of Object.keys(this._childDraft)) {
            let value = Reflect.get(this._childDraft, key);
            if (!(value instanceof Model)) continue;
            if (childPrev.includes(value)) {
                const index = childPrev.indexOf(value);
                if (index !== -1) childPrev.splice(index, 1);
                continue;
            }
            const model = value._isOrdered ? value.copy() : value;
            if (model !== value) Reflect.set(this._childDraft, key, model);
            model._isOrdered = true;
        }
    }
    
    private _isOrdered = false;
    private _isAutomic = false;
    private _is = false;

    private static ifAutomic(flag: boolean) {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            descriptor.value = function(this: Model, ...args: any[]) {
                if (this._isAutomic !== Boolean(flag)) return;
                return handler.call(this, ...args);
            }
            return descriptor;
        }
    }

    private _status: ModelStatus = ModelStatus.INITED;
    protected static ifStatus<R>(...status: ModelStatus[]) {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback<R | undefined>>
        ): TypedPropertyDescriptor<Callback<R | undefined>> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            descriptor.value = function(this: Model,...args: any[]) {
                const _status = status instanceof Array ? status : [status];
                if (!_status.includes(this._status)) return;
                return handler.call(this, ...args);
            }
            return descriptor;
        };
    }

    private static _hooksLoad: Readonly<string[]> = []
    private static _hooksUnload: Readonly<string[]> = []
    private static _hooksChildLoad: Readonly<string[]> = []
    private static _hooksChildUnload: Readonly<string[]> = []

    @Model.useLogger()
    @Model.ifStatus(ModelStatus.INITED)
    private _load(parent: P) {
        this._status = ModelStatus.LOADING;

        this._parent = parent;
        if (parent) parent._childByUuid[this.uuid] = this;

        for (const child of this._listChild(this.child)) child._load(this);

        let ancestor: Model | undefined = this._parent;
        while (ancestor) {
            const keys = ancestor._constructor._hooksChildLoad;
            for (const key of keys) {
                const handler = Reflect.get(ancestor, key);
                if (!(typeof handler === 'function')) continue;
                handler.call(ancestor, this);
            }
            ancestor = ancestor.parent;
        }

        for (const key of this._constructor._hooksLoad) {
            const handler = Reflect.get(this, key);
            if (!(typeof handler === 'function')) continue;
            handler.call(this);
        }

        this._status = ModelStatus.LOADED;
        this.reloadState();
    }

    @Model.useLogger()
    @Model.ifStatus(ModelStatus.LOADED)
    private _unload() {
        this._status = ModelStatus.UNLOADING;
        
        let ancestor: Model | undefined = this._parent;
        while (ancestor) {
            const keys = this._constructor._hooksChildUnload;
            for (const key of keys) {
                const handler = Reflect.get(ancestor, key);
                if (!(typeof handler === 'function')) continue;
                handler.call(ancestor, this);
            }
            ancestor = ancestor.parent;
        }
        const keys = this._constructor._hooksUnload;
        for (const key of keys) {
            const handler = Reflect.get(this, key);
            if (!(typeof handler === 'function')) continue;
            handler.call(this);
        }

        const parent = this._parent;
        this._parent = undefined;
        if (parent) delete parent._childByUuid[this.uuid];

        for (const child of this._listChild(this.child)) child._unload();

        for (const channel of this._eventConsumersByProducer) {
            const [ consumer ] = channel;
            const handler = this._eventHandlersByConsumer.get(consumer);
            if (!handler) continue;
            this.unbindEvent(undefined, handler)
        }
        for (const channel of this._eventProducersByConsumer) {
            const [ producer, consumers ] = channel;
            consumers.forEach(consumer => {
                const target = consumer.target;
                const handler = target._eventHandlersByConsumer.get(consumer);
                if (!handler) return;
                target.unbindEvent(producer, handler)
            });
        }
        for (const modifier of this._stateModifiers) {
            const target = modifier.target;
            const handler = target._stateHandlersByModifier.get(modifier);
            if (!handler) continue;
            target.unbindState(this, handler);
        }
        for (const channel of this._stateProducersByModifier) {
            const [ modifier ] = channel;
            const handler = this._stateHandlersByModifier.get(modifier);
            if (!handler) continue;
            this.unbindState(undefined, handler);
        }

        this._status = ModelStatus.INITED;
        this.reloadState();
    }

    readonly uuid: string;

    get path(): string[] | undefined {
        const result: string[] = [];
        let ancestor: Model | undefined = this;
        while (ancestor) {
            result.push(ancestor.uuid);
            ancestor = ancestor.parent;
        }
        return result;
    }

    queryChild(path: string[] | string): Model | undefined {
        if (typeof path === 'string') return this._childByUuid[path];
        for (const uuid of path) {
            const target = this._childByUuid[uuid];
            if (!target) continue;
            const index = path.indexOf(uuid) + 1;
            return target.queryChild(path.slice(index));
        }
        return undefined;
    }

    protected static onLoad() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            target._constructor._hooksLoad = [...target._constructor._hooksLoad, key];
            return descriptor;
        };
    }

    protected static onUnload() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            target._constructor._hooksUnload = [...target._constructor._hooksUnload, key];
            return descriptor;
        };
    }

    protected static onChildLoad() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback<unknown, [Model]>>
        ): TypedPropertyDescriptor<Callback<unknown, [Model]>> {
            target._constructor._hooksChildLoad = [...target._constructor._hooksChildLoad, key];
            return descriptor;
        };
    }

    protected static onChildUnload() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback<unknown, [Model]>>
        ): TypedPropertyDescriptor<Callback<unknown, [Model]>> {
            target._constructor._hooksChildUnload = [...target._constructor._hooksChildUnload, key];
            return descriptor;
        };
    }

    static precheck<F extends Callback>(target: Model, method: F, ...args: Parameters<F>) {
        const _validators = target._constructor._validators[method.name] || [];
        for (const validator of _validators) {
            const result = validator(target, ...args);
            if (!result) return false;
        }
        return true;
    }

    private static _validators: Readonly<Record<string, Readonly<Callback[]>>> = {};
    protected static if<M extends Model, R = any, P extends any[] = any[]>(
        validator: (target: M, ...args: P) => any,
        error?: string | Error,
    ) {
        return function (
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback<R | undefined, P>>
        ): TypedPropertyDescriptor<Callback<R | undefined, P>> {
            const handler = descriptor.value;
            const instance = {
                [key](this: M, ...args: P) {
                    const result = validator(this, ...args);
                    if (result && handler) return handler.apply(this, args);
                    if (error instanceof Error) throw error;
                    if (error) console.warn(error);
                    return
                }
            }
            descriptor.value = instance[key];
            const _validators = { ...target._constructor._validators };
            _validators[key] = _validators[key] || [];
            _validators[key] = [..._validators[key], validator];
            target._constructor._validators = _validators;
            return descriptor;
        };
    }


    
    private static _stack: string[] = []
    protected static useLogger() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Model, ...args: any[]) {
                    console.log(
                        new Array(Model._stack.length).fill('  ').join(''),
                        this.constructor.name + '::' + key
                    )
                    Model._stack.push(key);
                    const result = handler.call(this, ...args);
                    Model._stack.pop();
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        };
    }
}
