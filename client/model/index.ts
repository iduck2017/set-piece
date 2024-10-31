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
        D extends ModelDefine,
    > = Readonly<{
        childSet: Readonly<D['childSet'][]>;
        childMap: Readonly<D['childMap']>
        childModEventMap: Model.ChildModEventMap<Model, D['childMap']>,
        childSetModEvent: Model.ChildSetModEvent<Model, D['childSet']>,
        rawStateMap: Readonly<D['stateMap']>,
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
        childMap?: RawChildConfigMap<D['childMap']>;
    }

    export type Config<
        D extends ModelDefine
    > = {
        code?: string;
        type: D['type'];
        stateMap: D['stateMap'];
        childSet?: D['childSet']['config'][];
        childMap: ChildConfigMap<D['childMap']>
    }
}

export class Model<
    D extends ModelDefine = ModelDefine
> {
    // Product
    private static readonly _productReg: 
        Record<string, Model.Class> = {};
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
    static readonly _debugReg: 
        Map<Function, string[]> = new Map();
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
    private static readonly _activateReg: 
        Map<Function, string[]> = new Map();
    protected static useActivate() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Function>
        ): TypedPropertyDescriptor<Base.Function> {
            const keys = Model._activateReg.get(target.constructor) || [];
            keys.push(key);
            Model._activateReg.set(target.constructor, keys);
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
    readonly parent?: Model;
    constructor(
        config: Model.Config<D>,
        parent?: Model
    ) { 
        this.parent = parent;
        this.code = config.code || Model.ticket;
        this.type = config.type ;

        this._rawStateMap = Delegator.controlledMap(
            config.stateMap,
            this._onStateMod.bind(this)
        );
        this._curStateMap = { ...this._rawStateMap };
        this.curStateMap = Delegator.readonlyMap(this._curStateMap);

        this._childMap = Delegator.controlledMap(
            Object.keys(config.childMap).reduce(
                (acc, key: KeyOf<D['childMap']>) => {
                    const value = config.childMap[key];
                    if (!value) return acc;
                    return {
                        ...acc,
                        [key]: this._new(value)
                    };
                }, {} as D['childMap']
            ),
            this._onChildSetMod.bind(this)
        );
        this.childMap = Delegator.readonlyMap(this._childMap);

        this._childSet = ControlledArray<D['childSet']>(
            config.childSet?.map(c => this._new(c)) || [],
            this._onChildMod.bind(this, '')
        );
        this.childSet = Delegator.readonlyMap(this._childSet);

        let constructor: any = this.constructor;
        const that: any = this;
        while (constructor.__proto__ !== null) {
            for (const key of Model._debugReg.get(constructor) || []) {
                this._debugMap[key] = that[key];
            }
            for (const key of Model._activateReg.get(constructor) || []) {
                this._initSet.push(that[key].bind(this));
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
    }

    // Event
    protected readonly _eventMap: 
        Model.EventMap<D['eventMap']> = 
            Delegator.automicMap(() => new Event(
                this,
                this._onModelMod.bind(this)
            ));
    readonly eventMap: 
        Model.EventProxyMap<D['eventMap']> = 
            Delegator.automicMap(key => (
                this._eventMap[key].proxy
            ));

    protected readonly _stateGetEventMap: 
        Model.StateGetEventMap<typeof this, D['stateMap']> = 
            Delegator.automicMap(key => new Event(
                this,
                this._onStateMod.bind(this, key)
            ));
    readonly stateGetEventMap: 
        Model.StateGetEventProxyMap<typeof this, D['stateMap']> = 
            Delegator.automicMap(key => (
                this._stateGetEventMap[key].proxy
            ));

    protected readonly _stateModEventMap: 
        Model.StateModEventMap<typeof this, D['stateMap']> = 
            Delegator.automicMap(() => new Event(
                this,
                this._onModelMod.bind(this)
            ));

    readonly stateModEventMap: 
        Model.StateModEventProxyMap<typeof this, D['stateMap']> =
            Delegator.automicMap(key => (
                this._stateModEventMap[key].proxy
            ));

    protected readonly _childSetModEvent: 
        Model.ChildSetModEvent<typeof this, D['childSet']> = 
            new Event(
                this,
                this._onModelMod.bind(this)
            );
    readonly childSetModEvent: 
        Model.ChildSetModEventProxy<typeof this, D['childSet']> = 
            this._childSetModEvent.proxy;

    protected readonly _childModEventMap: 
        Model.ChildModEventMap<typeof this, D['childMap']> = 
            Delegator.automicMap(() => new Event(
                this,
                this._onModelMod.bind(this)
            ));
    readonly childModEventMap: 
        Model.ChildModEventProxyMap<typeof this, D['childMap']> = 
            Delegator.automicMap(key => (
                this._childModEventMap[key].proxy
            ));


    // State
    protected readonly _rawStateMap: D['stateMap'];
    private readonly _curStateMap: D['stateMap'];
    readonly curStateMap: Readonly<D['stateMap']>;

    private _onStateMod<K extends KeyOf<D['stateMap']>>(
        key: K,
        prev?: D['stateMap'][K]
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
    get config(): Model.RawConfig<D> {
        return {
            code: this.code,
            type: this.type,
            stateMap: this._rawStateMap,
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
                {} as Model.RawChildConfigMap<D['childMap']>
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
        console.log('onChildMod', key, value, isNew);
        if (!value) return;
        if (isNew) value._init();
        else value._uninit();
        this._onModelMod();
    }
    private _onChildSetMod(
        key: string,
        prev?: Model,
        next?: Model
    ) {
        console.log('onChildSetMod', prev, next);
        if (prev) prev._uninit();
        if (next) next._init();
        this._onModelMod();
    }
    
    protected _unmount() {
        if (this.parent) {
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
    protected _reload() {
        this._uninit();
        this._init();
    }

    // Inspector
    private readonly _debugMap: Record<string, Base.Function> = {};
    private readonly _setterSet: Array<React.Dispatch<
        React.SetStateAction<Model.Info<D>>
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