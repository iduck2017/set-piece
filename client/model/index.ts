import { AppStatus, type App } from "../app";
import { Base, KeyOf, ValueOf } from "../utils/base";
import { Event } from "../utils/event";
import { Delegator } from "../utils/proxy";
import { ControlledArray, ControlledProxy } from "../utils/proxy/controlled";

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
    static readonly #singletonSet = new Set<Function>();
    protected static useSingleton<T extends Base.Class>(
        IConstructor: T
    ) {
        return class extends IConstructor {
            constructor(...config: any) {
                if (Model.#singletonSet.has(IConstructor)) {
                    throw new Error();
                }
                Model.#singletonSet.add(IConstructor);
                super(...config);
            }
        };
    }

    // Product
    static readonly #productReg: Record<string, Model.Class> = {};
    protected static useProduct<
        T extends string,
        M extends Model<T>
    >(type: T) {
        return function (target: Model.Class<M>) {
            console.log(
                'useProduct', 
                type,
                target
            );
            Model.#productReg[type] = target;
        };
    }

    // Debug
    static readonly #debugReg: Map<Function, string[]> = new Map();
    protected static useDebug() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            console.log(
                'useDebug',
                target.constructor.name,
                key
            );
            const keys = Model.#debugReg.get(
                target.constructor
            ) || [];
            keys.push(key);
            Model.#debugReg.set(target.constructor, keys);
            return descriptor;
        };
    }


    // Activate
    static readonly #initReg: Map<Function, string[]> = new Map();
    static readonly #uninitReg: Map<Function, string[]> = new Map();
    protected static onInit() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            const keys = Model.#initReg.get(target.constructor) || [];
            keys.push(key);
            Model.#initReg.set(target.constructor, keys);
            return descriptor;
        };
    }
    protected static onUninit() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            const keys = Model.#uninitReg.get(target.constructor) || [];
            keys.push(key);
            Model.#uninitReg.set(target.constructor, keys);
            return descriptor;
        };
    }


    // Ticket 
    static #timestamp = Date.now(); 
    static #ticket = 36 ** 2;
    static get ticket(): string {
        let now = Date.now();
        const ticket = Model.#ticket;
        Model.#ticket += 1;
        if (Model.#ticket > 36 ** 3 - 1) {
            Model.#ticket = 36 ** 2;
            while (now === Model.#timestamp) {
                now = Date.now();
            }
        }
        this.#timestamp = now;
        return now.toString(36) + ticket.toString(36);
    }


    // Constructor
    readonly code: string;
    readonly type: T;
    readonly app: App;
    readonly parent: Model | App;
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

        this.$rawStateMap = Delegator.controlledMap(
            config.stateMap,
            this.#onStateMod.bind(this)
        );
        this.#curStateMap = { ...this.$rawStateMap };
        this.curStateMap = Delegator.readonlyMap(this.#curStateMap);

        const childMap = {} as D;
        for (const key in config.childMap) {
            const value = config.childMap[key];
            if (value) {
                childMap[key] = this.$new(value);
            }
        }
        this.$childMap = ControlledProxy(
            childMap, 
            this.#onChildMod.bind(this)
        );
        this.childMap = Delegator.readonlyMap(this.$childMap);

        this.$childSet = ControlledArray<L>(
            config.childSet?.map(c => this.$new(c)) || [],
            this.#onChildMod.bind(this, '')
        );
        this.childSet = Delegator.readonlyMap(this.$childSet);

        this.$eventMap = Delegator.automicMap(() => new Event(
            this,
            this.#onModelMod.bind(this)
        ));
        this.eventMap = Delegator.automicMap(key => this.$eventMap[key].proxy);

        this.$stateModEventMap = Delegator.automicMap(() => new Event(
            this,
            this.#onModelMod.bind(this)
        ));
        this.stateModEventMap = Delegator.automicMap(key => (
            this.$stateModEventMap[key].proxy
        ));

        this.$childSetModEvent = new Event(
            this,
            this.#onModelMod.bind(this)
        );
        this.childSetModEvent = this.$childSetModEvent.proxy;

        this.$childModEventMap = Delegator.automicMap(() => new Event(
            this,
            this.#onModelMod.bind(this)
        ));
        this.childModEventMap = Delegator.automicMap(key => (
            this.$childModEventMap[key].proxy
        ));


        this.#setterSet = [];

        this.#debugMap = {};
        let constructor: any = this.constructor;
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const instance: any = this;
        while (constructor.__proto__ !== null) {
            for (const key of Model.#debugReg.get(constructor) || []) {
                this.#debugMap[key] = instance[key];
            }
            for (const key of Model.#initReg.get(constructor) || []) {
                this.#initSet.push(instance[key].bind(this));
            }
            for (const key of Model.#uninitReg.get(constructor) || []) {
                this.#uninitSet.push(instance[key].bind(this));
            }
            constructor = constructor.__proto__;
        }
    }

    // Refer
    readonly #referSet: Model[] = [];
    readonly #referMap: Record<string, Model[] | Model> = {};
    
    connect(refer: Model) {
        if (!this.#referSet.includes(refer)) {
            this.#referSet.push(refer);   
        } 
    }

    #unconnect(refer: Model) {
        const index = this.#referSet.indexOf(refer);
        if (index < 0) return;
        this.#referSet.splice(index, 1);
        const events = [
            ...Object.values(this.$eventMap),
            ...Object.values(this.$stateGetEventMap),
            ...Object.values(this.$stateModEventMap),
            ...Object.values(this.$childModEventMap),
            this.$childSetModEvent
        ];
        for (const event of events) {
            event.uninit(refer);
        }
        console.log(
            'unconnect', 
            this.#referSet
        );
    }

    // Event
    protected readonly $eventMap: Model.EventMap<E>;
    readonly eventMap: Model.EventProxyMap<E>;

    protected readonly $stateGetEventMap: 
        Model.StateGetEventMap<typeof this, S> = 
            Delegator.automicMap(key => new Event(
                this,
                this.#onStateMod.bind(this, key)
            ));
    readonly stateGetEventMap: 
        Model.StateGetEventProxyMap<typeof this, S> = 
            Delegator.automicMap(key => (
                this.$stateGetEventMap[key].proxy
            ));

    protected readonly $stateModEventMap: 
        Model.StateModEventMap<typeof this, S>;
    readonly stateModEventMap: 
        Model.StateModEventProxyMap<typeof this, S>;

    protected readonly $childSetModEvent: 
        Model.ChildSetModEvent<typeof this, L>;
    readonly childSetModEvent: 
        Model.ChildSetModEventProxy<typeof this, L>;

    protected readonly $childModEventMap: 
        Model.ChildModEventMap<typeof this, D>;
    readonly childModEventMap: 
        Model.ChildModEventProxyMap<typeof this, D>;

    // State
    readonly #curStateMap: S;
    readonly curStateMap: Readonly<S>;
    protected readonly $rawStateMap: S;

    #onStateMod<K extends KeyOf<S>>(
        key: K,
        prev?: S[K]
    ) {
        if (prev === undefined) {
            prev = this.#curStateMap[key];
        }
        const raw = this.$rawStateMap[key];
        console.log('onStateGet', key, raw, prev);
        const result = this.$stateGetEventMap[key].emit({
            model: this,
            raw: raw,
            cur: raw
        });
        const next = result.cur;
        this.#curStateMap[key] = next;
        if (prev !== next) {
            console.log('onStateMod', key, prev, next);
            this.$stateModEventMap[key].emit({
                model: this,
                prev,
                next
            });
        }
        this.#onModelMod();
    }

    // Serialize
    get config(): Model.RawConfig<T, S, D, L> {
        const childMap = {} as Model.ChildConfigMap<D>;
        for (const key in this.$childMap) {
            const value = this.$childMap[key];
            if (value) {
                childMap[key] = value.config;
            }
        }
        return {
            code: this.code,
            type: this.type,
            stateMap: this.$rawStateMap,
            childSet: this.$childSet.map(c => c.config),
            childMap: childMap
        };
    }

    protected $new<M extends Model>(
        config: M['config']
    ): M {
        const Type = Model.#productReg[config.type];
        if (!Type) {
            throw new Error(`Model ${config.type} not found`);
        }
        return new Type(config, this) as M;
    }

    // child
    protected readonly $childSet: L[];
    protected readonly $childMap: D;
    readonly childSet: Readonly<L[]>;
    readonly childMap: Readonly<D>;

    #onChildMod(
        key: string,
        value: Model,
        isNew: boolean
    ) {
        if (!value) return;
        if (isNew) value.$init();
        else value.$uninit();
        this.#onModelMod();
    }
    
    protected $unmount() {
        if (this.parent instanceof Model) {
            for (const key in this.parent.$childMap) {
                if (this.parent.$childMap[key] === this) {
                    delete this.parent.$childMap[key];
                    return;
                }
            }
            const index = this.parent.$childSet.indexOf(this);
            if (index >= 0) {
                this.parent.$childSet.splice(index, 1);
                return;
            }
        }
    }

    // Lifecycle
    #initSet: Base.Function[] = [];
    #uninitSet: Base.Function[] = [];
    protected $init() {
        for (const init of this.#initSet) {
            init();
        }
        for (const child of [
            ...Object.values(this.$childMap),
            ...this.$childSet
        ]) {
            child.$init();
        }
    }

    protected $uninit() {
        for (const uninit of this.#uninitSet) { 
            uninit();
        }
        for (const child of [
            ...Object.values(this.$childMap),
            ...this.$childSet
        ]) {
            child.$uninit();
        }
        for (const refer of [
            ...this.#referSet
        ]) {
            refer.#unconnect(this);
            this.#unconnect(refer);
        }
    }

    // inspector
    readonly #debugMap: Record<string, Base.Function>;
    readonly #setterSet: Array<React.Dispatch<
        React.SetStateAction<Model.Info<S, E, D, L>>
    >>;
    #onModelMod() {
        for (const setInfo of this.#setterSet) {
            setInfo({
                stateGetEventMap: {
                    ...this.$stateGetEventMap
                },
                stateModEventMap: {
                    ...this.$stateModEventMap
                },
                childModEventMap: {
                    ...this.$childModEventMap
                },
                childSetModEvent: this.$childSetModEvent,
                childMap: { ...this.$childMap },
                childSet: [ ...this.$childSet ],
                rawStateMap: { ...this.$rawStateMap },
                curStateMap: { ...this.#curStateMap },
                eventMap: { ...this.$eventMap },
                referSet: [ ...this.#referSet ],
                debugMap: { ...this.#debugMap }
            });
        }
    }
    readonly useInfo = (
        setter: React.Dispatch<
            React.SetStateAction<Model.Info<S, E, D, L>>
        >
    ) => {
        this.#setterSet.push(setter);
        this.#onModelMod();
        return () => {
            const index = this.#setterSet.indexOf(setter);
            if (index < 0) return;
            this.#setterSet.splice(index, 1);
        };
    };
}