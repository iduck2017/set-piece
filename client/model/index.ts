import { Base, KeyOf } from "../type/base";
import { ModelDefine, RawModelDefine } from "../type/define";
import { Event } from "../util/event";
import { Delegator } from "../util/proxy";
import { ControlledArray } from "../util/proxy/controlled";

export namespace Model {
    export type Class<M extends Model = Model> = new (
        config: M['config'], 
        parent: Model
    ) => M;

    export type ChildConfigMap<
        D extends ModelDefine,
    > = {
        [K in keyof D['childMap']]?: D['childMap'][K] extends Required<D['childMap']>[K] ?
            Required<D['childMap']>[K]['config'] :
            Required<D['childMap']>[K]['config'] | undefined
    };

    export type StateGetEventMap<
        M extends Model,
        S extends Base.Map,
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
        S extends Base.Map,
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
        S extends Base.Map,
    > = {
        [K in KeyOf<S>]: Event<{
            model: M;
            prev: S[K];
            next: S[K];
        }>
    }

    export type StateModEventProxyMap<
        M extends Model,
        S extends Base.Map,
    > = {
        [K in KeyOf<S>]: Event.Proxy<{
            model: M;
            prev: S[K];
            next: S[K];
        }>
    }

    export type EventMap<E extends Base.Map> = {
        [K in KeyOf<E>]: Event<E[K]>
    }

    export type EventProxyMap<E extends Base.Map> = {
        [K in KeyOf<E>]: Event.Proxy<E[K]>
    }

    export type Info<
        D extends ModelDefine,
    > = Readonly<{
        childSet: Readonly<D['childSet'][]>;
        childMap: Readonly<D['childMap']>
        rawStateMap: Readonly<D['stateMap']>,
        rawReferMap: Readonly<D['referMap']>
        curStateMap: Readonly<D['stateMap']>,
        stateModEventMap: Model.StateModEventMap<Model, D['stateMap']>,
        stateGetEventMap: Model.StateGetEventMap<Model, D['stateMap']>,
        eventMap: Model.EventMap<D['eventMap']>;
        referSet: Model[],
        debugMap: Record<string, Base.Function>
    }>

    export type RawConfig<
        D extends ModelDefine
    > = {
        type: D['type'];
        code?: string;
        stateMap?: Partial<D['stateMap']>;
        childSet?: D['childSet']['config'][],
        childMap?: Partial<ChildConfigMap<D>>
    }

    export type Config<
        D extends ModelDefine
    > = {
        code?: string;
        type: D['type'];
        stateMap: D['stateMap'];
        referMap: D['referMap'];
        childSet?: D['childSet']['config'][];
        childMap: ChildConfigMap<D>
    }
}

export class Model<
    D extends ModelDefine = ModelDefine
> {
    static readonly _validatorReg: Map<Function, Record<
        string, 
        Array<(model: Model) => boolean>>
    > = new Map();
    static useValidator<M extends Model>(
        validator: (model: M) => boolean, 
        strict?: boolean
    ) {
        return function (
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            const handler = descriptor.value;
            const validatorMap = Model._validatorReg.get(
                target.constructor
            ) || {};
            if (!validatorMap[key]) {
                validatorMap[key] = [];
            }
            validatorMap[key].push(validator);
            Model._validatorReg.set(
                target.constructor, 
                validatorMap
            );
            descriptor.value = function(
                this: M, 
                ...args
            ) {
                if (validator(this)) {
                    return handler?.apply(this, args);
                } else if (strict) {
                    throw new Error('Invalidate state');
                }
            };
            return descriptor;
        };
    }

    // Product
    private static readonly _productReg: Record<string, Model.Class> = {};
    protected static useProduct<
        T extends string,
        M extends Model<RawModelDefine<{
            type: T
        } & ModelDefine>>
    >(type: T) {
        return function (target: Model.Class<M>) {
            Model._productReg[type] = target;
        };
    }

    // Debug
    static readonly _debuggerReg: Map<Function, string[]> = new Map();
    protected static useDebugger<M extends Model>() {
        return function(
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            const debuggerSet = Model._debuggerReg.get(
                target.constructor
            ) || [];
            debuggerSet.push(key);
            Model._debuggerReg.set(
                target.constructor, 
                debuggerSet
            );
            return descriptor;
        };
    }

    // Mount
    private static readonly _loaderReg: Map<Function, string[]> = new Map();
    protected static useLoader() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            const keys = Model._loaderReg.get(target.constructor) || [];
            keys.push(key);
            Model._loaderReg.set(target.constructor, keys);
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

    // Constructor
    readonly type: D['type'];
    readonly code: string;
    readonly parent: D['parent'];
    constructor(
        config: Model.Config<D>,
        parent: D['parent']
    ) { 
        this.parent = parent;
        this.code = config.code || Model.ticket;
        this.type = config.type;

        this._rawStateMap = Delegator.controlledMap(
            config.stateMap,
            this._onStateMod.bind(this)
        );
        this._rawReferMap = Delegator.controlledMap(
            config.referMap,
            this._onStateMod.bind(this)
        );
        
        this._curStateMap = { 
            ...this._rawStateMap,
            ...this._rawReferMap
        };
        this.curStateMap = Delegator.readonlyMap(this._curStateMap);

        this._childMap = Delegator.controlledMap(
            Object.keys(config.childMap).reduce((acc, key: KeyOf<D['childMap']>) => {
                const value = config.childMap[key];
                if (!value) return acc;
                return {
                    ...acc,
                    [key]: this._new(value)
                };
            }, {} as D['childMap']),
            this._onChildSetMod.bind(this)
        );
        this.childMap = Delegator.readonlyMap(this._childMap);

        this._childSet = ControlledArray<D['childSet']>(
            config.childSet?.map(c => this._new(c)) || [],
            this._onChildMod.bind(this, '')
        );
        this.childSet = Delegator.readonlyMap(this._childSet);

        let constructor: any = this.constructor;
        while (constructor.__proto__ !== null) {
            for (const key of Object.keys(
                Model._validatorReg.get(constructor) || {}
            )) {
                if (!this._validatorMap[key]) {
                    this._validatorMap[key] = [];
                }
                const validatorSet = Model._validatorReg.get(constructor)?.[key] || [];
                this._validatorMap[key].push(
                    ...validatorSet
                );
            }
            for (const key of Model._debuggerReg.get(constructor) || []) {
                const runner: any = Reflect.get(this, key);
                this._debuggerMap[key] = runner.bind(this);
            }
            for (const key of Model._loaderReg.get(constructor) || []) {
                const loader: any = Reflect.get(this, key);
                this._loaderSet.push(loader.bind(this));
            }
            constructor = constructor.__proto__;
        }
    }

    // Refer
    private readonly _referSet: Model[] = [];
    connect(refer: Model) {
        if (!this._referSet.includes(refer)) {
            this._referSet.push(refer); 
            this._onModelMod();  
        } 
    }
    private _unconnect(refer: Model) {
        const index = this._referSet.indexOf(refer);
        if (index < 0) return;
        this._referSet.splice(index, 1);
        for (const key of Object.keys(this._rawReferMap)) {
            if (this._rawReferMap[key] === refer) {
                delete this._rawReferMap[key];  
            }
        }
        const events = [
            ...Object.values(this._eventMap),
            ...Object.values(this._stateGetEventMap),
            ...Object.values(this._stateModEventMap)
            // ...Object.values(this._childModEventMap),
            // this._childSetModEvent
        ];
        for (const event of events) {
            event.uninit(refer);
        }
    }
    // Event
    protected readonly _eventMap: Model.EventMap<D['eventMap']> = 
        Delegator.automicMap(() => new Event(
            this,
            this._onModelMod.bind(this)
        ));
    readonly eventMap: Model.EventProxyMap<D['eventMap']> = 
        Delegator.automicMap(key => (
            this._eventMap[key].proxy
        ));

    protected readonly _stateGetEventMap: Model.StateGetEventMap<
        typeof this, 
        D['stateMap'] & D['referMap']
    > = Delegator.automicMap(key => new Event(
            this,
            this._onStateMod.bind(this, key)
        ));
    readonly stateGetEventMap: Model.StateGetEventProxyMap<
        typeof this, 
        D['stateMap'] & D['referMap']
    > = Delegator.automicMap(key => (
            this._stateGetEventMap[key].proxy
        ));
    protected readonly _stateModEventMap: Model.StateModEventMap<
        typeof this, 
        D['stateMap'] & D['referMap']
    > = Delegator.automicMap(() => new Event(
            this,
            this._onModelMod.bind(this)
        ));
    readonly stateModEventMap: Model.StateModEventProxyMap<
        typeof this, 
        D['stateMap'] & D['referMap']
    > = Delegator.automicMap(key => (
            this._stateModEventMap[key].proxy
        ));


    // State
    protected readonly _rawStateMap: D['stateMap'];
    protected readonly _rawReferMap: D['referMap'];
    private readonly _curStateMap: D['stateMap'] & D['referMap'];
    readonly curStateMap: Readonly<D['stateMap'] & D['referMap']>;

    private _onStateMod<K extends KeyOf<D['stateMap'] & D['referMap']>>(
        key: K,
        prev?: (D['stateMap'] & D['referMap'])[K],
        next?: any
    ) {
        if (next instanceof Model) {
            next.connect(this);
        }
        const _prev = prev || this._curStateMap[key];
        const raw = {
            ...this._rawStateMap,
            ...this._rawReferMap
        }[key];
        const result = this._stateGetEventMap[key].emit({
            model: this,
            raw: raw,
            cur: raw
        });
        const _next = result.cur;
        this._curStateMap[key] = _next;
        if (prev !== next) {
            this._stateModEventMap[key].emit({
                model: this,
                prev: _prev,
                next: _next
            });
        }
        this._onModelMod();
    }

    // Serialize
    get config(): Model.RawConfig<D> {
        return {
            code: this.code,
            type: this.type,
            stateMap: { ...this._rawStateMap },
            childSet: this._childSet.map(c => c.config),
            childMap: Object.keys(this._childMap).reduce(
                (acc, key) => {
                    const value = this._childMap[key];
                    if (!value) return acc;
                    return {
                        ...acc,
                        [key]: value.config
                    };
                },
                {} as Model.ChildConfigMap<D>
            )
        };
    }

    protected _new<M extends Model>(
        config: M['config']
    ): M {
        const Type = Model._productReg[config.type];
        if (!Type) throw new Error(`Model ${config.type} not found`);
        return new Type(config, this) as M;
    }

    // child
    protected readonly _childSet: D['childSet'][];
    protected readonly _childMap: D['childMap'];
    readonly childSet: Readonly<D['childSet'][]>;
    readonly childMap: Readonly<D['childMap']>;

    private _onChildMod(
        key: string,
        value: Model,
        isNew: boolean
    ) {
        if (!value) return;
        if (isNew) value._load();
        else value._unload();
        this._onModelMod();
    }
    private _onChildSetMod(
        key: string,
        prev?: Model,
        next?: Model
    ) {
        if (prev) prev._unload();
        if (next) next._load();
        this._onModelMod();
    }
    
    // Lifecycle
    private readonly _loaderSet: Base.Function[] = [];
    private _load() {
        for (const loader of this._loaderSet) {
            loader();
        }
        for (const child of [
            ...Object.values(this._childMap),
            ...this._childSet
        ]) {
            child._load();
        }
    }
    private _unload() {
        for (const child of [
            ...Object.values(this._childMap),
            ...this._childSet
        ]) {
            child._unload();
        }
        for (const refer of this._referSet) {
            refer._unconnect(this);
            this._unconnect(refer);
        }
    }

    // Inspector
    private readonly _validatorMap: Record<string, Array<(model: Model) => boolean>> = {};
    private readonly _debuggerMap: Record<string, Base.Function> = {};
    private readonly _setterSet: Array<React.Dispatch<
        React.SetStateAction<Model.Info<D>>
    >> = [];
    private _onModelMod() {
        for (const setInfo of this._setterSet) {
            setInfo({
                stateGetEventMap: { ...this._stateGetEventMap },
                stateModEventMap: { ...this._stateModEventMap },
                childMap: { ...this._childMap },
                childSet: [ ...this._childSet ],
                rawStateMap: { ...this._rawStateMap },
                curStateMap: { ...this._curStateMap },
                eventMap: { ...this._eventMap },
                referSet: [ ...this._referSet ],
                rawReferMap: { ...this._rawReferMap },
                debugMap: Object.keys(this._debuggerMap).reduce((prev, key) => {
                    const validatorSet = this._validatorMap[key];
                    if (validatorSet) {
                        for (const validator of validatorSet) {
                            if (!validator(this)) {
                                const next = { ...prev };
                                delete next[key];
                                return next;
                            }
                        }
                    }
                    return prev;
                }, { ...this._debuggerMap })
            });
        }
    }
    readonly useInfo = (
        setter: React.Dispatch<
            React.SetStateAction<Model.Info<D>>
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