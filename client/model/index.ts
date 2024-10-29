import type { App } from "../app";
import { Base, KeyOf } from "../utils/base";
import { Event } from "../utils/event";
import { Delegator } from "../utils/proxy";
import { ControlledArray, ControlledProxy } from "../utils/proxy/controlled";
import { RootModel } from "./root";

export namespace Model {
    export type Class<M extends Model = Model> = new (
        config: M['config'], 
        parent: Model | App
    ) => M;

    export type ChildConfigMap<
        D extends Record<string, Model>,
    > = {
        [K in keyof D]: D[K] extends Required<D>[K] ?
            Required<D>[K]['config'] :
            Required<D>[K]['config'] | undefined
    }

    export type RawChildConfigMap<
        D extends Record<string, Model>,
    > = {
        [K in keyof D]?: Required<D>[K]['config']
    }

    export type StateGetEventMap<
        M extends Model,
        S extends Base.Data,
    > = {
        [K in KeyOf<S>]: Event<{
            model: M;
            raw: S[K];
            cur: S[K];
            isBreak?: boolean;
        }>
    }

    export type StateGetEventProxyMap<
        M extends Model,
        S extends Base.Data,
    > = {
        [K in KeyOf<S>]: Event.Proxy<{
            model: M;
            raw: S[K];
            cur: S[K];
            isBreak?: boolean;
        }>
    }

    export type StateModEventMap<
        M extends Model,
        S extends Base.Data,
    > = {
        [K in KeyOf<S>]: Event<{
            model: M;
            prev: S[K];
            next: S[K];
        }>
    }

    export type StateModEventProxyMap<
        M extends Model,
        S extends Base.Data,
    > = {
        [K in KeyOf<S>]: Event.Proxy<{
            model: M;
            prev: S[K];
            next: S[K];
        }>
    }

    export type ChildSetModEvent<
        M extends Model,
        L extends Model,
    > = Event<{
        add: L[];
        del: L[],
        model: M
    }>

    export type ChildSetModEventProxy<
        M extends Model,
        L extends Model,
    > = Event.Proxy<{
        add: L[];
        del: L[],
        model: M
    }>

    export type ChildModEventMap<
        M extends Model,
        D extends Record<string, Model>,
    > = {
        [K in KeyOf<D>]: Event<{
            model: M;
            child: D[K];
        }>
    }

    export type ChildModEventProxyMap<
        M extends Model,
        D extends Record<string, Model>,
    > = {
        [K in KeyOf<D>]: Event.Proxy<{
            model: M;
            child: D[K];
        }>
    }

    export type EventMap<E extends Base.Map> = {
        [K in KeyOf<E>]: Event<E[K]>
    }

    export type EventProxyMap<E extends Base.Map> = {
        [K in KeyOf<E>]: Event.Proxy<E[K]>
    }

    export type Info<
        S extends Base.Data = Base.Data,
        E extends Base.Map = Base.Map,
        D extends Record<string, Model> = Record<string, Model>,
        L extends Model = Model,
    > = Readonly<{
        childSet: Readonly<Readonly<L>[]>;
        childMap: Readonly<D>
        childModEventMap: Model.ChildModEventMap<Model, D>,
        childSetModEvent: Model.ChildSetModEvent<Model, L>,
        rawStateMap: Readonly<S>,
        curStateMap: Readonly<S>,
        stateModEventMap: Model.StateModEventMap<Model, S>,
        stateGetEventMap: Model.StateGetEventMap<Model, S>,
        eventMap: Model.EventMap<E>;
        referSet: Model[],
        debugMap: Record<string, Base.Function>
    }>

    export type RawConfig<
        T extends string, 
        S extends Base.Data,
        D extends Record<string, Model>,
        L extends Model,
    > = {
        type: T;
        code?: string;
        stateMap?: Partial<S>;
        childSet?: L['config'][],
        childMap?: RawChildConfigMap<D>;
    }

    export type Config<
        T extends string, 
        S extends Base.Data,
        D extends Record<string, Model>,
        L extends Model,
    > = {
        type: T;
        code?: string;
        stateMap: S;
        childSet?: L['config'][];
        childMap: ChildConfigMap<D>
    }
}

export class Model<
    T extends string = string, 
    S extends Base.Data = Base.Data,
    E extends Base.Map = Base.Map,
    D extends Record<string, Model> = Base.Map,
    L extends Model = any,
> {
    protected static _useRoot() {
        return function(
            IConstructor: Model.Class
        ): any {
            return class extends IConstructor {
                constructor(config: Model['config'], parent: App) {
                    super(config, parent);
                    this._init();
                }

            };
        };
    }

    // Product
    private static readonly _productReg: Record<string, Model.Class> = {};
    protected static _useProduct<
        T extends string,
        M extends Model<T>
    >(type: T) {
        return function (target: Model.Class<M>) {
            Model._productReg[type] = target;
        };
    }

    // Debug
    static readonly _debugReg: Map<Function, string[]> = new Map();
    protected static useDebug() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            const keys = Model._debugReg.get(
                target.constructor
            ) || [];
            keys.push(key);
            Model._debugReg.set(target.constructor, keys);
            return descriptor;
        };
    }


    // Activate
    private static readonly _initReg: Map<Function, string[]> = new Map();
    private static readonly _uninitReg: Map<Function, string[]> = new Map();

    protected static onInit() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            const keys = Model._initReg.get(target.constructor) || [];
            keys.push(key);
            Model._initReg.set(target.constructor, keys);
            return descriptor;
        };
    }
    protected static onUninit() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            const keys = Model._uninitReg.get(target.constructor) || [];
            keys.push(key);
            Model._uninitReg.set(target.constructor, keys);
            return descriptor;
        };
    }


    // Ticket 
    private static _timestamp = Date.now(); 
    private static _ticket = 36 ** 2;

    static get ticket(): string {
        let now = Date.now();
        const ticket = Model._ticket;
        Model._ticket += 1;
        if (Model._ticket > 36 ** 3 - 1) {
            Model._ticket = 36 ** 2;
            while (now === Model._timestamp) {
                now = Date.now();
            }
        }
        this._timestamp = now;
        return now.toString(36) + ticket.toString(36);
    }

    
    readonly app: App;
    readonly parent: Model | App;
    get root(): RootModel {
        if (!this.app.root) {
            throw new Error('Root not found');
        }
        return this.app.root;
    }


    // Constructor
    readonly code: string;
    readonly type: T;
    constructor(
        config: Model.Config<T, S, D, L>,
        parent: Model | App
    ) { 
        this.app = parent instanceof Model? 
            parent.app : 
            parent;
        this.parent = parent;
        this.code = config.code || Model.ticket;
        this.type = config.type ;

        this._rawStateMap = Delegator.controlledMap(
            config.stateMap,
            this._onStateMod.bind(this)
        );
        this._curStateMap = { ...this._rawStateMap };
        this.curStateMap = Delegator.readonlyMap(this._curStateMap);

        const childMap = {} as D;
        for (const key in config.childMap) {
            const value = config.childMap[key];
            if (value) {
                childMap[key] = this._new(value);
            }
        }
        this._childMap = ControlledProxy(
            childMap, 
            this._onChildMod.bind(this)
        );
        this.childMap = Delegator.readonlyMap(this._childMap);

        this._childSet = ControlledArray<L>(
            config.childSet?.map(c => this._new(c)) || [],
            this._onChildMod.bind(this, '')
        );
        this.childSet = Delegator.readonlyMap(this._childSet);

        let constructor: any = this.constructor;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const instance: any = this;
        while (constructor.__proto__ !== null) {
            for (const key of Model._debugReg.get(constructor) || []) {
                this._debugMap[key] = instance[key];
            }
            for (const key of Model._initReg.get(constructor) || []) {
                this._initSet.push(instance[key].bind(this));
            }
            for (const key of Model._uninitReg.get(constructor) || []) {
                this._uninitSet.push(instance[key].bind(this));
            }
            constructor = constructor.__proto__;
        }
    }

    // Refer
    private readonly _referSet: Model[] = [];
    private readonly _referMap: Record<string, Model[] | Model> = {};
    
    connect(refer: Model) {
        if (!this._referSet.includes(refer)) {
            this._referSet.push(refer);   
        } 
    }

    private _unconnect(refer: Model) {
        const index = this._referSet.indexOf(refer);
        if (index < 0) return;
        this._referSet.splice(index, 1);
        const events = [
            ...Object.values(this._eventMap),
            ...Object.values(this._stateGetEventMap),
            ...Object.values(this._stateModEventMap),
            ...Object.values(this._childModEventMap),
            this._childSetModEvent
        ];
        for (const event of events) {
            event.uninit(refer);
        }
        console.log(
            'unconnect', 
            this._referSet
        );
    }

    // Event
    protected readonly _eventMap: Model.EventMap<E> = 
        Delegator.automicMap(() => new Event(
            this,
            this._onModelMod.bind(this)
        ));
    readonly eventMap: Model.EventProxyMap<E> = 
        Delegator.automicMap(key => (
            this._eventMap[key].proxy
        ));

    protected readonly _stateGetEventMap: 
        Model.StateGetEventMap<typeof this, S> = 
            Delegator.automicMap(key => new Event(
                this,
                this._onStateMod.bind(this, key)
            ));
    readonly stateGetEventMap: 
        Model.StateGetEventProxyMap<typeof this, S> = 
            Delegator.automicMap(key => (
                this._stateGetEventMap[key].proxy
            ));

    protected readonly _stateModEventMap: 
        Model.StateModEventMap<typeof this, S> = 
            Delegator.automicMap(() => new Event(
                this,
                this._onModelMod.bind(this)
            ));
    readonly stateModEventMap: 
        Model.StateModEventProxyMap<typeof this, S> =
            Delegator.automicMap(key => (
                this._stateModEventMap[key].proxy
            ));

    protected readonly _childSetModEvent: 
        Model.ChildSetModEvent<typeof this, L> = 
            new Event(
                this,
                this._onModelMod.bind(this)
            );
    readonly childSetModEvent: 
        Model.ChildSetModEventProxy<typeof this, L> = 
            this._childSetModEvent.proxy;

    protected readonly _childModEventMap: 
        Model.ChildModEventMap<typeof this, D> = 
            Delegator.automicMap(() => new Event(
                this,
                this._onModelMod.bind(this)
            ));
    readonly childModEventMap: 
        Model.ChildModEventProxyMap<typeof this, D> = 
            Delegator.automicMap(key => (
                this._childModEventMap[key].proxy
            ));


    // State
    protected readonly _rawStateMap: S;
    private readonly _curStateMap: S;
    readonly curStateMap: Readonly<S>;

    private _onStateMod<K extends KeyOf<S>>(
        key: K,
        prev?: S[K]
    ) {
        if (prev === undefined) {
            prev = this._curStateMap[key];
        }
        const raw = this._rawStateMap[key];
        console.log('onStateGet', key, raw, prev);
        const result = this._stateGetEventMap[key].emit({
            model: this,
            raw: raw,
            cur: raw
        });
        const next = result.cur;
        this._curStateMap[key] = next;
        if (prev !== next) {
            console.log('onStateMod', key, prev, next);
            this._stateModEventMap[key].emit({
                model: this,
                prev,
                next
            });
        }
        this._onModelMod();
    }

    // Serialize
    get config(): Model.RawConfig<T, S, D, L> {
        const childMap = {} as Model.ChildConfigMap<D>;
        for (const key in this._childMap) {
            const value = this._childMap[key];
            if (value) {
                childMap[key] = value.config;
            }
        }
        return {
            code: this.code,
            type: this.type,
            stateMap: this._rawStateMap,
            childSet: this._childSet.map(c => c.config),
            childMap: childMap
        };
    }

    protected _new<M extends Model>(
        config: M['config']
    ): M {
        const Type = Model._productReg[config.type];
        if (!Type) {
            throw new Error(`Model ${config.type} not found`);
        }
        return new Type(config, this) as M;
    }

    // child
    protected readonly _childSet: L[];
    protected readonly _childMap: D;
    readonly childSet: Readonly<L[]>;
    readonly childMap: Readonly<D>;

    private _onChildMod(
        key: string,
        value: Model,
        isNew: boolean
    ) {
        if (!value) return;
        if (isNew) value._init();
        else value._uninit();
        this._onModelMod();
    }
    
    protected _unmount() {
        if (this.parent instanceof Model) {
            for (const key in this.parent._childMap) {
                if (this.parent._childMap[key] === this) {
                    delete this.parent._childMap[key];
                    return;
                }
            }
            const index = this.parent._childSet.indexOf(this);
            if (index >= 0) {
                this.parent._childSet.splice(index, 1);
                return;
            }
        }
    }

    // Lifecycle
    private readonly _initSet: Base.Function[] = [];
    private readonly _uninitSet: Base.Function[] = [];
    private _init() {
        for (const init of this._initSet) {
            init();
        }
        for (const child of [
            ...Object.values(this._childMap),
            ...this._childSet
        ]) {
            child._init();
        }
    }
    private _uninit() {
        for (const uninit of this._uninitSet) { 
            uninit();
        }
        for (const child of [
            ...Object.values(this._childMap),
            ...this._childSet
        ]) {
            child._uninit();
        }
        for (const refer of [
            ...this._referSet
        ]) {
            refer._unconnect(this);
            this._unconnect(refer);
        }
    }

    // inspector
    private readonly _debugMap: Record<string, Base.Function> = {};
    private readonly _setterSet: Array<React.Dispatch<
        React.SetStateAction<Model.Info<S, E, D, L>>
    >> = [];
    private _onModelMod() {
        for (const setInfo of this._setterSet) {
            setInfo({
                stateGetEventMap: {
                    ...this._stateGetEventMap
                },
                stateModEventMap: {
                    ...this._stateModEventMap
                },
                childModEventMap: {
                    ...this._childModEventMap
                },
                childSetModEvent: this._childSetModEvent,
                childMap: { ...this._childMap },
                childSet: [ ...this._childSet ],
                rawStateMap: { ...this._rawStateMap },
                curStateMap: { ...this._curStateMap },
                eventMap: { ...this._eventMap },
                referSet: [ ...this._referSet ],
                debugMap: { ...this._debugMap }
            });
        }
    }
    readonly useInfo = (
        setter: React.Dispatch<
            React.SetStateAction<Model.Info<S, E, D, L>>
        >
    ) => {
        this._setterSet.push(setter);
        this._onModelMod();
        return () => {
            const index = this._setterSet.indexOf(setter);
            if (index < 0) return;
            this._setterSet.splice(index, 1);
        };
    };
}