import { Def, Seq } from "../type/define";
import { Base, KeyOf, PartialOf, RequiredOf, Strict, ValidOf } from "../type/base";
import { Delegator } from "@/util/proxy";
import { Event } from "@/util/event";
import React from "react";

export namespace Model {
    export type Seq<M extends Model> = M extends never ? undefined : M['seq'];
    export type Parent<M extends Model> = M['parent'];
    export type State<M extends Model> = M['state'];
    export type Child<M extends Model> = M['child'];
}

export abstract class Model<T extends Partial<Def> = any> {
    static useDebugger<M extends Model>(
        validator?: ((model: M) => boolean) | boolean
    ) {
        return function (
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const handler = descriptor.value;
            descriptor.value = function(
                this: M, 
                ...args
            ) {
                const logger = console.log;
                const flag = typeof validator === 'function' ? validator(this) : validator;
                if (flag) {
                    console.log(key, '>', 'function call:', {
                        target: this,
                        args
                    });
                }
                console.log = (...args) => {
                    if (flag) logger(key, '>', ...args);
                };
                const result = handler?.apply(this, args);
                console.log = logger;
                if (flag) {
                    console.log(key, '>', 'function return:', result);
                }
                return result;
            };
            return descriptor;
        };
    }

    private readonly _validators: Record<string, Array<(model: Model) => boolean>> = {};
    static readonly _validators: Map<Function, 
        Record<string, Array<Base.Func>>
    > = new Map();
    static useValidator<M extends Model>(
        validator: (model: M) => boolean, 
        strict?: boolean
    ) {
        return function (
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const handler = descriptor.value;
            const validatorDict = Model._validators.get(target.constructor) || {};
            if (!validatorDict[key]) validatorDict[key] = [];
            validatorDict[key].push(validator);
            Model._validators.set(target.constructor, validatorDict);
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

    private static readonly _products: Record<string, Base.Class> = {};
    protected static useProduct<
        T extends string,
        M extends { type: T }
    >(type: T) {
        return function (target: Base.Class<M>) {
            Model._products[type] = target;
            console.log('[useProduct]', type, Model._products);
        };
    }

    private static readonly _loaders: Map<Function, string[]> = new Map();
    protected static useLoader() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const keys = Model._loaders.get(target.constructor) || [];
            keys.push(key);
            Model._loaders.set(target.constructor, keys);
            return descriptor;
        };
    }

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

    readonly id: string;
    readonly type: Def.Type<T>;
    readonly parent: Def.Parent<T>;
    
    constructor(
        seq: {
            id?: string,
            type: Def.Type<T>,
            childDict: Readonly<Strict<{
                [K in KeyOf<ValidOf<RequiredOf<Def.ChildDict<T>>>>]: 
                    Model.Seq<Def.ChildDict<T>[K]>
            } & {
                [K in KeyOf<ValidOf<PartialOf<Def.ChildDict<T>>>>]?: 
                    Model.Seq<Required<Def.ChildDict<T>>[K]>
            }>>,
            childList: Readonly<Strict<{
                [K in KeyOf<ValidOf<RequiredOf<Def.ChildList<T>>>>]: 
                    Model.Seq<Def.ChildList<T>[K][number]>[]
            } & {
                [K in KeyOf<ValidOf<PartialOf<Def.ChildList<T>>>>]?: 
                    Model.Seq<Required<Def.ChildList<T>>[K][number]>[]
            }>>,
            memoState: Readonly<Strict<Def.State<T> & Def.InitState<T>>>,
            tempState: Readonly<Strict<Def.TempState<T>>>,
        },
        parent: Def.Parent<T>
    ) {
        this.type = seq.type;
        this.parent = parent;
        this.id = seq.id || Model.ticket;

        this._memoState = Delegator.ControlledDict(
            Delegator.Editable(seq.memoState), 
            this._onStateMod.bind(this)
        );
        this._tempState = Delegator.ControlledDict(
            Delegator.Editable(seq.tempState), 
            this._onStateMod.bind(this)
        );
        this._state = {
            ...seq.memoState,
            ...seq.tempState
        };
        this.state = Delegator.Readonly(this._state);

        this._childDict = Delegator.ControlledDict(
            Object.keys(seq.childDict).reduce((
                acc, 
                key: KeyOf<Def.ChildDict<T>>
            ) => {
                const value = seq.childDict[key];
                if (!value) return acc;
                return {
                    ...acc,
                    [key]: this._new(value)
                };
            }, {} as Def.ChildDict<T>),
            this._onChildMod.bind(this)
        );
        this._childList = Delegator.Automic<any>(() => (
            Delegator.ControlledList([], this._onChildMod.bind(this, ''))
        ), Object.keys(seq.childList).reduce((
            acc, 
            key: KeyOf<Def.ChildList<T>>
        ) => {
            const value: Seq<Def>[] = seq.childList[key];
            if (!value) return acc;
            return {
                ...acc,
                [key]: Delegator.ControlledList(
                    value.map((seq: Seq<Def>) => this._new(seq)),
                    this._onChildMod.bind(this, '')
                )
            };
        }, {} as Def.ChildList<T>));

        let constructor: any = this.constructor;
        while (constructor.__proto__ !== null) {
            for (const key of Object.keys(
                Model._validators.get(constructor) || {}
            )) {
                if (!this._validators[key]) {
                    this._validators[key] = [];
                }
                const validatorSet = Model._validators.get(constructor)?.[key] || [];
                this._validators[key].push(
                    ...validatorSet
                );
            }
            for (const key of Model._loaders.get(constructor) || []) {
                const loader: any = Reflect.get(this, key);
                this._loaders.push(loader.bind(this));
            }
            constructor = constructor.__proto__;
        }
    }

    protected readonly _childDict: ValidOf<Def.ChildDict<T>>;
    protected readonly _childList: Readonly<ValidOf<Required<Def.ChildList<T>>>>;
    get child(): ValidOf<Def.ChildDict<T>> & Readonly<ValidOf<Def.ChildList<T>>> {
        return {
            ...this._childDict,
            ...this._childList
        };
    } 
    
    @Model.useDebugger(true)
    private _onChildMod(
        key: string,
        prev?: Model | Model[],
        next?: Model | Model[]
    ) {
        if (prev) {
            if (prev instanceof Array) {
                prev.map(model => model._unload());
            } else prev._unload();
        }
        if (next) {
            if (next instanceof Array) {
                next.map(model => model._load());
            } else next._load(); 
        }
        this._baseEvent.childMod.emit({
            model: this,
            next: this.child
        });
    }
    public useChild(setter: React.Dispatch<Model.Child<Model<T>>>) {
        return this._baseEvent.childMod.on(this, data => {
            setter(data.next);
        });
    }

    private _stateLock: boolean = false;
    protected readonly _memoState: Def.State<T> & Def.InitState<T>;
    protected readonly _tempState: Def.TempState<T>;
    private readonly _state: Def.State<T> & Def.InitState<T> & Def.TempState<T>;
    readonly state: Readonly<Def.State<T> & Def.InitState<T> & Def.TempState<T>>;

    @Model.useDebugger(false)
    private _onStateMod() {
        if (this._stateLock) return;
        console.log('execute');
        const prev = {
            ...this._memoState,
            ...this._tempState
        };
        const result = this._baseEvent.stateGet.emit({
            model: this,
            prev,
            next: prev
        });
        if (result && result.isBreak) return;
        const { next } = result;
        console.log('next', next, this._state);
        let isChanged = false;
        for (const key of Object.keys(next)) {
            if (next[key] !== this._state[key]) {
                isChanged = true;
                break;
            } 
        }
        if (isChanged) {
            console.log('isChanged');
            Object.keys(next).forEach((
                key: KeyOf<Readonly<Def.State<T> & Def.InitState<T> & Def.TempState<T>>>
            ) => {
                this._state[key] = next[key];
            });
            this._baseEvent.stateMod.emit({
                model: this,
                prev,
                next
            });
        }
    }
    protected _setMemoState(next: Readonly<Def.State<T> & Def.InitState<T>>) {
        this._stateLock = true;
        Object.keys(next).forEach((key: KeyOf<Def.State<T> & Def.InitState<T>>) => {
            this._memoState[key] = next[key];
        });
        this._onStateMod();
        this._stateLock = false;
    }
    protected _setTempState(next: Readonly<Def.TempState<T>>) {
        this._stateLock = true;
        Object.keys(next).forEach((key: KeyOf<Def.TempState<T>>) => {
            this._tempState[key] = next[key];
        });
        this._onStateMod();
        this._stateLock = false;
    }
    public useState(setter: React.Dispatch<Model.State<Model<T>>>) {
        return this._baseEvent.stateMod.on(this, data => {
            setter(data.next);
        });
    }

    
    private readonly _refer: Model[] = [];
    connect(refer: Model) {
        if (!this._refer.includes(refer)) {
            this._refer.push(refer); 
        } 
    }
    private _unconnect(refer: Model) {
        if (refer === this) return;

        const index = this._refer.indexOf(refer);
        if (index < 0) return;
        this._refer.splice(index, 1);

        const tempState: Def.TempState<T> = this._tempState;
        for (const key of Object.keys(tempState)) {
            if (tempState[key] instanceof Model) {
                delete tempState[key];  
            }
            if (tempState[key] instanceof Array) {
                for (const index in tempState[key]) {
                    if (tempState[key][index] instanceof Model) {
                        delete tempState[key];
                    }
                }
            }
        }

        for (const key of Object.keys({
            ...this._event,
            ...this._baseEvent
        })) {
            this._event[key].unload(refer);
        }
    }

    protected readonly _event: Readonly<{
        [K in KeyOf<Def.Event<T>>]: Event<Def.Event<T>[K]>
    }> = Delegator.Automic(() => new Event(this));
    private readonly _baseEvent: {
        stateMod: Event<{
            model: Model<T>,
            prev: Model.State<Model<T>>,
            next: Model.State<Model<T>>,
            isBreak?: boolean
        }>
        stateGet: Event<{
            model: Model<T>,
            prev: Model.State<Model<T>>,
            next: Model.State<Model<T>>,
            isBreak?: boolean
        }>,
        childMod: Event<{
            model: Model<T>,
            next: Model.Child<Model<T>>,
        }>
    } = {
            stateMod: new Event(this),
            stateGet: new Event(this),
            childMod: new Event(this)
        };
    readonly event: Readonly<{
        [K in KeyOf<Def.Event<T>>]: Event.Proxy<Def.Event<T>[K]>
    }> & {
        stateMod: Event.Proxy<{
            model: Model<T>,
            prev: Model.State<Model<T>>,
            next: Model.State<Model<T>>,
            isBreak?: boolean
        }>
        stateGet: Event.Proxy<{
            model: Model<T>,
            prev: Model.State<Model<T>>,
            next: Model.State<Model<T>>,
            isBreak?: boolean
        }>,
        childMod: Event.Proxy<{
            model: Model<T>,
            next: Model.Child<Model<T>>,
        }>
    } = Delegator.Automic<any>((key) => {
        if (
            key === 'stateMod' ||
            key === 'stateGet' ||
            key === 'childMod'
        ) {
            return this._baseEvent[key].proxy;
        } else {
            return this._event[key].proxy;
        }
    });

    private readonly _loaders: Base.Func[] = [];
    private _load() {
        for (const loader of this._loaders) {
            loader();
        }
        const childDict: Def.ChildDict<T> = this._childDict;
        const childList: Def.ChildList<T> = this._childList;
        for (const child of [
            ...Object.values(childDict),
            ...Object.values(childList).reduce((acc, value) => {
                return [ ...acc, ...value ];
            }, [])
        ]) {
            child?._load();
        }
    }
    private _unload() {
        const childDict: Def.ChildDict<T> = this._childDict;
        const childList: Def.ChildList<T> = this._childList;
        const child: Model[] = [];
        for (const model of [
            ...Object.values(childDict),
            ...Object.values(childList).reduce((acc, value) => {
                return [ ...acc, ...value ];
            }, child)
        ]) {
            model?._unload();
        }
        for (const refer of this._refer) {
            refer._unconnect(this);
            this._unconnect(refer);
        }
    }
    
    get seq(): Seq<T> {
        return {
            id: this.id,
            type: this.type,
            memoState: { ...this._memoState },
            childDict: Object.keys(this._childDict).reduce(
                (acc, key: KeyOf<Def.ChildDict<T>>) => {
                    const model = this._childDict[key];
                    if (!model) return acc;
                    return {
                        ...acc,
                        [key]: model.seq
                    };
                },
                {} as Readonly<Strict<Partial<{
                    [K in KeyOf<ValidOf<Def.ChildDict<T>>>]?: 
                        Model.Seq<Required<Def.ChildDict<T>>[K]>
                }>>>
            ),
            childList: Object.keys(this._childList).reduce(
                (acc, key: KeyOf<Def.ChildList<T>>) => {
                    const models = this._childList[key];
                    if (!models) return acc;
                    return {
                        ...acc,
                        [key]: models.map(model => model.seq)
                    };
                },
                {} as Readonly<Strict<Partial<{
                    [K in KeyOf<ValidOf<Def.ChildList<T>>>]?: 
                        Model.Seq<Required<Def.ChildList<T>>[K][number]>[]
                }>>>
            )
        };
    }

    @Model.useDebugger(false)
    protected _new<M extends Model>(
        seq: Model.Seq<M>
    ): M {
        const Type = Model._products[seq.type];
        console.log('type', Type?.name, seq, Model._products);
        if (!Type) throw new Error(`Model ${seq.type} not found`);
        return new Type(seq, this) as M;
    }
}
