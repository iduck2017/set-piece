import type { App } from "../app";
import { Base, KeyOf } from "../type";
import { AutomicProxy } from "../utils/proxy/automic";
import { ControlledArray, ControlledProxy } from "../utils/proxy/controlled";
import { ReadonlyProxy } from "../utils/proxy/readonly";

export type ModelConfig<
    I extends string = any, 
    S extends Record<string, Base.Value> = any,
    D extends Record<string, Model> = any,
    L extends Model = any,
> = {
    id?: string;
    code: I;
    state?: Partial<S>;
    child?: {
        dict?: { [K in keyof D]?: Required<D>[K]['config'] }
        list?: L['config'][]
    }
}

export type ModelEvent<
    S extends Record<string, any> = any,
    D extends Record<string, Model> = any,
    L extends Model = any,
    E extends Record<string, any> = any,
> = Readonly<{
    base: Readonly<{
        [K in keyof E]: Event<E[K]>
    }>,
    state: Readonly<{
        edit: {
            [K in keyof S]: Event<{
                target: Model<string, S>;
                prev: S[K];
                next: S[K];
            }>
        },
        post: {
            [K in keyof S]: Event<{
                target: Model<string, S>;
                prev: S[K];
                next: S[K];
            }>
        }
    }>,
    child: Readonly<{
        list: Event<{
            value: L;
        }>,
        dict: {
            [K in KeyOf<D>]: Event<{
                key: K;
                value: D[K];
            }>
        }
    }>
}>

export type SafeModelEvent<
    S extends Record<string, Base.Value> = any,
    D extends Record<string, Model> = any,
    L extends Model = any,
    E extends Record<string, any> = any,
> = Readonly<{
    base: Readonly<{
        [K in keyof E]: SafeEvent<E[K]>
    }>,
    state: Readonly<{
        edit: Readonly<{
            [K in keyof S]: SafeEvent<{
                target: Model<string, S>;
                prev: S[K];
                next: S[K];
            }>
        }>,
        post: Readonly<{
            [K in keyof S]: SafeEvent<{
                target: Model<string, S>;
                prev: S[K];
                next: S[K];
            }>
        }>
    }>,
    child: Readonly<{
        list: SafeEvent<{
            value: L;
        }>,
        dict: Readonly<{
            [K in KeyOf<D>]: SafeEvent<{
                key: K;
                value: D[K];
            }>
        }>
    }>
}>


export type ModelInfo<
    S extends Base.Data = any,
    D extends Record<string, Model> = any,
    L extends Model = any,
    E extends Base.Dict = any,
> = Readonly<{
    child: Readonly<{
        list: Readonly<Readonly<L>[]>,
        dict: Readonly<{
            [K in keyof D]: Readonly<D[K]>
        }>,
    }>,
    state: {
        raw: Readonly<S>,
        cur: Readonly<S>,
    },
    refer: Model[],
    debug: Record<string, Base.Function>
    event: ModelEvent<S, D, L, E>;
}>

type SafeEvent<E> = Readonly<{
    on(
        refer: Model, 
        handler: (form: E) => E | void
    ): void;
    off(
        refer: Model, 
        handler?: (form: E) => E | void
    ): void;
}>

export class Event<E> implements SafeEvent<E> {
    readonly #handleUpdate: () => void;

    readonly #handleEvent: Array<Readonly<[
        Model,
        (form: E) => E | void,
    ]>>;
    get handleEvent() {
        return [ ... this.#handleEvent ];
    } 

    readonly parent: Model;
    readonly safeEvent: SafeEvent<E>;
    
    constructor(
        parent: Model,
        handleUpdate: () => void
    ) {
        this.#handleEvent = [];
        this.#handleUpdate = handleUpdate;

        this.parent = parent;
        this.safeEvent = {
            on: this.on.bind(this),
            off: this.off.bind(this)
        };
    }

    on(
        refer: Model,
        handler: (form: E) => E | void
    ) {
        this.#handleEvent.push([ refer, handler ]);
        refer.connect(this.parent);
        this.parent.connect(refer);
        this.#handleUpdate();
    }

    off(
        refer: Model,
        handler: (form: E) => E | void
    ) {
        this.destroy(refer, handler);
    }

    destroy(
        refer: Model,
        handler?: (form: E) => E | void
    ) {
        while (true) {
            const index = this.#handleEvent.findIndex(([ 
                $refer, 
                $handler 
            ]) => {
                if (!handler) return $refer === refer;
                return $refer === refer && $handler === handler;
            });
            if (index < 0) break;
            this.#handleEvent.splice(index, 1);
        }
        this.#handleUpdate();
    }

    emit(form: E): E {
        let $event = form;
        const handleEvent = [ ...this.#handleEvent ];
        for (const [ refer, handler ] of handleEvent) {
            const result = handler.call(refer, $event);
            if (result) $event = result;
        }
        return $event;
    }
}

export class Model<
    I extends string = any, 
    S extends Record<string, Base.Value> = any,
    D extends Record<string, Model> = any,
    L extends Model = any,
    E extends Record<string, any> = any,
> {
    // product
    static readonly #product: Record<
        string, 
        new (
            config: Model['config'], 
            parent: Model | App
        ) => Model
    > = {};

    static readonly #debug: Map<
        Function,
        string[]
    > = new Map();

    protected static $useProduct<
        I extends string,
        M extends Model<I>
    >(code: I) {
        return function (
            target: new (
                config: M['config'], 
                parent: Model | App
            ) => M
        ) {
            console.log(
                'useProduct', 
                code,
                target
            );
            Model.#product[code] = target;
        };
    }

    protected static $useDebug() {
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
            const keys = Model.#debug.get(
                target.constructor
            ) || [];
            keys.push(key);
            Model.#debug.set(target.constructor, keys);
            return descriptor;
        };
    }

    static #ticket = 36 ** 2;
    static #timestamp = Date.now(); 

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

    static #registry: Record<string, Model> = {};
    protected static get registry(): Readonly<Record<string, Model>> {
        return { ...this.#registry };
    }

    readonly id: string;
    readonly code: I;
    readonly app: App;
    readonly parent: Model | App;

    constructor(
        config: {
            id?: string;
            code: I;
            state: S;
            child: {
                dict: {
                    [K in keyof D]: D[K] extends Required<D>[K] ?
                        Required<D>[K]['config'] :
                        Required<D>[K]['config'] | undefined
                },
                list?: L['config'][]
            }
        },
        parent: Model | App
    ) {

        // context
        this.parent = parent;
        this.app = parent instanceof Model? 
            parent.app : 
            parent;

        // unique id
        this.code = config.code;
        this.id = config.id || Model.ticket;
        Model.#registry[this.id] = this;

        // state
        this.$state = ControlledProxy(
            config.state,
            this.#updateState.bind(this)
        );
        this.#state = { 
            ...this.$state 
        };
        this.state = ReadonlyProxy(this.#state);
        
        // child
        const dict = {} as D;
        for (const key in config.child.dict) {
            const value = config.child.dict[key];
            if (value) {
                dict[key] = this.$new(value);
            }
        } 
        this.$child = {
            dict: ControlledProxy(
                dict,
                this.#updateChild.bind(this)
            ),
            list: ControlledArray<L>(
                config.child.list?.map(c => this.$new(c)) || [],
                this.#updateChild.bind(this, '')
            )
        };
        this.child = {
            dict: ReadonlyProxy(this.$child.dict),
            list: ReadonlyProxy(this.$child.list)
        };

        // event
        this.#refer = [];
        this.$event = {
            base: AutomicProxy(() => new Event(
                this,
                this.#updateInfo.bind(this)
            )),
            state: {
                edit: AutomicProxy((key: string) => new Event(
                    this,
                    this.#updateState.bind(this, key)
                )),
                post: AutomicProxy(() => new Event(
                    this,
                    this.#updateInfo.bind(this)
                ))
            },
            child: {
                list: new Event(
                    this,
                    this.#updateInfo.bind(this)
                ),
                dict: AutomicProxy(() => new Event(
                    this,
                    this.#updateInfo.bind(this)
                ))
            }
        };
        this.event = {
            base: AutomicProxy(key => (
                this.$event.base[key].safeEvent
            )),
            state: {
                edit: AutomicProxy(key => (
                    this.$event.state.edit[key].safeEvent
                )),
                post: AutomicProxy(key => (
                    this.$event.state.post[key].safeEvent
                ))
            },  
            child: {
                list: this.$event.child.list.safeEvent,
                dict: AutomicProxy(key => (
                    this.$event.child.dict[key].safeEvent
                ))
            }
        };

        this.#setInfo = [];

        this.$debug = {};
        let constructor = this.constructor;
        while (Reflect.get(constructor, '__proto__') !== null) {
            console.log(
                'getDebug',
                constructor.name,
                Model.#debug.get(this.constructor)
            );
            for (const key of Model.#debug.get(constructor) || []) {
                this.$debug[key] = Reflect.get(this, key) as Base.Function;
            }
            constructor = Reflect.get(constructor, '__proto__');
        }
    }

    readonly #refer: Model[];
    connect(refer: Model) {
        if (this.#refer.includes(refer)) return;
        this.#refer.push(refer);    
    }
    #unconnect(refer: Model) {
        const index = this.#refer.indexOf(refer);
        if (index < 0) return;
        this.#refer.splice(index, 1);
        const events = [
            ...Object.values(this.$event.state.edit),
            ...Object.values(this.$event.state.post),
            ...Object.values(this.$event.base),
            ...Object.values(this.$event.child.dict),
            this.$event.child.list
        ] as Event<any>[];
        for (const event of events) {
            event.destroy(refer);
        }
        console.log(
            'unconnect', 
            this.#refer
        );
    }

    protected readonly $event: ModelEvent<S, D, L, E>;
    readonly event: SafeModelEvent<S, D, L, E>;

    readonly state: Readonly<S>;
    readonly #state: S;
    protected readonly $state: S;

    #updateState(
        key: KeyOf<S>
    ) {
        // const $prev = prev === undefined ?
        //     this.$state[key] :
        //     prev;
        const current = this.$state[key];
        const signal = {
            target: this,
            prev: current,
            next: current
        };
        const { next } = this.$event.state.edit[key].emit(signal);
        // console.log('updateState', key, next, $prev);
        this.#state[key] = next;
        this.$event.state.post[key].emit(signal);
        this.#updateInfo();
    }

    // serialize
    get config(): ModelConfig<I, S, D, L> {
        const dict = {} as {
            [K in keyof D]?: D[K]['config']
        };
        for (const key in this.$child.dict) {
            const value = this.$child.dict[key];
            if (value) {
                dict[key] = value.config;
            }
        }
        return {
            id: this.id,
            code: this.code,
            state: this.$state,
            child: {
                list: this.$child.list.map(c => c.config),
                dict
            }
        };
    }
    protected $new<M extends Model>(
        config: M['config']
    ): M {
        const Type = Model.#product[config.code];
        if (!Type) {
            throw new Error(`Model ${config.code} not found`);
        }
        return new Type(config, this) as M;
    }

    protected $unmount() {
        if (this.parent instanceof Model) {
            for (const key in this.parent.$child.dict) {
                if (this.parent.$child.dict[key] === this) {
                    delete this.parent.$child.dict[key];
                    return;
                }
            }
            // console.log('unmount');
            const index = this.parent.$child.list.indexOf(this);
            if (index >= 0) {
                this.parent.$child.list.splice(index, 1);
                return;
            }
        }
    }


    // child
    protected readonly $child: {
        readonly dict: D
        readonly list: L[]
    };
    readonly child: {
        readonly dict: Readonly<{
            [K in keyof D]: Readonly<D[K]>
        }>
        readonly list: Readonly<Readonly<L>[]>
    };
    #updateChild(
        key: string,
        value: Model,
        isNew: boolean
    ) {
        if (!value) return;
        if (isNew) value.$activateAll();
        else value.#destroy();
        this.#updateInfo();
    }

    // lifecycle
    #isActive = false;
    protected $activate() {}
    protected $activateAll() {
        if (this.#isActive) {
            throw new Error(
                'Model is already active'
            );
        }
        this.$activate();
        for (const child of [
            ...Object.values(this.$child.dict),
            ...this.$child.list
        ]) {
            child.$activateAll();
        }
        this.#isActive = true;
    }

    protected $deactivate() {}
    protected $deactivateAll() {
        if (!this.#isActive) {
            throw new Error(
                'Model is already deactive'
            );
        }
        this.$deactivate();
        for (const child of [
            ...Object.values(this.$child.dict),
            ...this.$child.list
        ]) {
            child.$deactivateAll();
        }
        for (const refer of [
            ...this.#refer
        ]) {
            refer.#unconnect(this);
            this.#unconnect(refer);
        }
        this.#isActive = false;
    }

    #destroy() {
        this.$deactivateAll();
        delete Model.#registry[this.id];
    }


    // inspector
    protected readonly $debug: Record<string, Base.Function>;
    readonly #setInfo: Array<React.Dispatch<
        React.SetStateAction<ModelInfo<S, D, L>>
    >>;
    #updateInfo() {
        // console.log('updateInfo', this.state);
        for (const setInfo of this.#setInfo) {
            setInfo({
                child: this.child,
                state: {
                    raw: { ...this.$state },
                    cur: { ...this.#state }
                },
                refer: [ ...this.#refer ],
                debug: { ...this.$debug },
                event: this.$event
            });
        }
    }
    readonly useInfo = (
        setInfo: React.Dispatch<
            React.SetStateAction<ModelInfo<S, D, L>>
        >
    ) => {
        this.#setInfo.push(setInfo);
        this.#updateInfo();
        return () => {
            const index = this.#setInfo.indexOf(setInfo);
            if (index < 0) return;
            this.#setInfo.splice(index, 1);
        };
    };
}