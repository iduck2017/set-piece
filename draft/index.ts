import { Def, Seq } from "../client/type/define";
import { Base, KeyOf, Strict, ValidOf } from "../client/type/base";
import { Delegator } from "@/util/proxy";
import { OptionalKeys, RequiredKeys } from "utility-types";

export namespace Model {
    export type Seq<M extends Model> = M extends never ? undefined : M['seq'];
    export type Parent<M extends Model> = M['parent'];
    export type State<M extends Model> = M['state'];
    export type Child<M extends Model> = M['child'];
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class IEvent<E> {
    readonly target: Model;
    readonly key: string;

    constructor(
        target: Model,
        key: string
    ) {
        this.target = target;
        this.key = key;
    }
}

export abstract class Model<T extends Partial<Def> = any> {
    static useDebugger<M extends Model>(
        validator?: ((model: M) => boolean) | boolean
    ) {
        const logger = console.log;
        return function (
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const handler = descriptor.value;
            descriptor.value = function(this: M, ...args) {
                const flag = typeof validator === 'function' ? validator(this) : validator;
                const _logger = console.log;
                console.log = (...args) => {
                    if (flag) logger(key, '>', ...args);
                };
                const result = handler?.apply(this, args);
                console.log = _logger;
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
            descriptor.value = function(this: M, ...args) {
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
        M extends Model
    >(type: T) {
        return function (Type: new (
            seq: Model.Seq<M>, 
            parent: Model.Parent<M>
        ) => M & { type: T }) {
            Model._products[type] = Type;
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

    
    private static readonly _unloaders: Map<Function, string[]> = new Map();
    protected static useUnloader() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const keys = Model._unloaders.get(target.constructor) || [];
            keys.push(key);
            Model._unloaders.set(target.constructor, keys);
            return descriptor;
        };
    }

    private static _timestamp = Date.now(); 
    private static _ticket = 36 ** 2;
    private static _registry: Record<string, Model> = {};
    static query(id: string) {
        return Model._registry[id];
    }
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
        return ticket.toString(36) + now.toString(36);
    }

    readonly id: string;
    readonly type: Def.Type<T>;
    readonly parent: Def.Parent<T>;
    constructor(
        seq: {
            id?: string,
            type: Def.Type<T>,
            childDict: Readonly<Strict<{
                [K in RequiredKeys<ValidOf<Def.ChildDict<T>>>]: 
                    Model.Seq<Def.ChildDict<T>[K]>
            } & {
                [K in OptionalKeys<ValidOf<Def.ChildDict<T>>>]?: 
                    Model.Seq<Required<Def.ChildDict<T>>[K]>
            }>>,
            childList: Readonly<Strict<{
                [K in RequiredKeys<ValidOf<Def.ChildList<T>>>]: 
                    Model.Seq<Def.ChildList<T>[K][number]>[]
            } & {
                [K in OptionalKeys<ValidOf<Def.ChildList<T>>>]?: 
                    Model.Seq<Required<Def.ChildList<T>>[K][number]>[]
            }>>,
            memoState: Readonly<Strict<Def.MemoState<T>>>,
            tempState: Readonly<Strict<Def.TempState<T>>>,
        },
        parent: Def.Parent<T>
    ) {
        this.type = seq.type;
        this.parent = parent;
        this.id = seq.id || Model.ticket;
        Model._registry[this.id] = this;

        this._memoState = Delegator.Controlled(
            { ...seq.memoState }, 
            this._onStateReset.bind(this)
        );
        this._tempState = Delegator.Controlled(
            { ... seq.tempState }, 
            this._onStateReset.bind(this)
        );
        this._state = {
            ...seq.memoState,
            ...seq.tempState
        };

        const childDict: any = {};
        for (const key in seq.childDict) {
            const _key: KeyOf<Def.ChildDict<T>> = key;
            const value = seq.childDict[key];
            if (!value) continue;
            childDict[_key] = this._new(value);
        }
        this._childDict = Delegator.Controlled(
            childDict,
            this._onChildUpdate.bind(this)
        );
        
        const childList: any = {};
        for (const key in seq.childList) {
            const _key: KeyOf<Def.ChildList<T>> = key;
            const value = seq.childList[key];
            if (!value) continue;
            childList[_key] = Delegator.ControlledList(
                value.map(seq => this._new(seq)),
                this._onChildUpdate.bind(this)
            );
        }
        this._childList = Delegator.Automic(
            () => Delegator.ControlledList([], this._onChildUpdate.bind(this)), 
            childList
        );

        let constructor: any = this.constructor;
        while (constructor.__proto__ !== null) {
            for (const key in Model._validators.get(constructor)) {
                if (!this._validators[key]) this._validators[key] = [];
                const validatorSet = Model._validators.get(constructor)?.[key] || [];
                this._validators[key].push(...validatorSet);
            }
            for (const key of Model._loaders.get(constructor) || []) {
                const loader: any = Reflect.get(this, key);
                this._loaders.push(loader.bind(this));
            }
            for (const key of Model._unloaders.get(constructor) || []) {
                const unloader: any = Reflect.get(this, key);
                this._unloaders.push(unloader.bind(this));
            }
            constructor = constructor.__proto__;
        }
    }
    

    protected readonly _childDict: ValidOf<Def.ChildDict<T>>;
    protected readonly _childList: Readonly<ValidOf<Required<Def.ChildList<T>>>>;
    get child(): Readonly<Def.ChildDict<T> & Def.ChildList<T>> {
        return {
            ...this._childDict, 
            ...this._childList
        };
    }
    
    @Model.useDebugger(false)
    private _onChildUpdate(event: {
        key: string,
        prev?: Model | Model[],
        next?: Model | Model[]
    }) {
        const { key, prev, next } = event;
        if (prev instanceof Array) prev.map(target => target._unload());
        else prev?._unload();
        if (next instanceof Array) next.map(target => target._load());
        else next?._load(); 
        this._emit(this.event.childUpdate, {
            target: this,
            next: this.child
        });
        delete Model._registry[this.id];
    }
    public useChild(setter: (data: {
        target: Model<T>,
        next: Model.Child<Model<T>>
    }) => void) {
        this._bind(this.event.childUpdate, setter);
        return () => {
            this._unbind(this.event.childUpdate, setter);
        };
    }

    private _stateLock: boolean = false;
    
    protected readonly _memoState: Def.MemoState<T>;
    protected readonly _tempState: Def.TempState<T>;

    private readonly _state: Def.MemoState<T> & Def.TempState<T>;
    get state(): Readonly<Def.MemoState<T> & Def.TempState<T>> {
        return {
            ...this._state
        };
    }

    @Model.useDebugger(true)
    private _onStateReset<
        K extends KeyOf<T>,
        T extends Record<string, any>
    >(event?: {
        key: K,
        prev?: T[K],
        next?: T[K]
    }) {
        const assigned: any = event?.key;
        if (assigned instanceof Model) {
            assigned._refers.push(this);
        }
        if (assigned instanceof Array) {
            assigned.forEach(target => {
                if (target instanceof Model) {
                    target._refers.push(this);
                }
            });
        }
        // todo add refer
        if (this._stateLock) return;
        const prev = {
            ...this._memoState,
            ...this._tempState
        };
        const result = this._emit(this.event.stateCheck, {
            target: this,
            prev,
            next: prev
        });
        if (result && result.isBreak) return;
        const { next } = result;

        let isChanged = false;
        for (const key in next) {
            if (next[key] !== this._state[key]) {
                isChanged = true;
                break;
            } 
        }
        console.log('isChanged', next, isChanged);
        if (isChanged) {
            for (const key in next) {
                const _key: KeyOf<Def.MemoState<T> & Def.TempState<T>> = key;
                this._state[_key] = next[key];
            }
            this._emit(this.event.stateUpdate, {
                target: this,
                prev,
                next
            });
        }
    }
    // protected _setMemoState(next: Readonly<Def.MemoState<T>>) {
    //     this._stateLock = true;
    //     for (const key in next) {
    //         const _key: KeyOf<Def.MemoState<T>> = key;
    //         this._memoState[_key] = next[_key];
    //     }
    //     this._onStateReset();
    //     this._stateLock = false;
    // }

    // protected _setTempState(next: Readonly<Def.TempState<T>>) {
    //     this._stateLock = true;
    //     for (const key in next) {
    //         const _key: KeyOf<Def.TempState<T>> = key;
    //         this._state[_key] = this._memoState[_key];
    //     }
    //     this._onStateReset();
    //     this._stateLock = false;
    // }

    public useState(setter: (data: {
        target: Model<T>,
        prev: Model.State<Model<T>>,
        next: Model.State<Model<T>>
    }) => void) {
        this._bind(this.event.stateUpdate, setter);
        return () => {
            this._unbind(this.event.stateUpdate, setter);
        };
    }

    private _refers: Model[] = [];
    _unconnect(refer: Model) {
        this._refers = this._refers.filter(target => target !== refer);
        for (const key in this._tempState) {
            let value: any = this._tempState[key];
            if (value === refer) {
                delete this._tempState[key];
            }
            if (value instanceof Array) {
                value = value.filter(target => target !== refer);
                this._tempState[key] = value;
            }
        }
    }

    private readonly _handlers: Record<string, [Model, Base.Func][]> = {};
    private readonly _emitters: Map<Base.Func, IEvent<any>[]> = new Map();

    @Model.useDebugger(true)
    protected _bind<E>(
        event: IEvent<E>,
        handler: Base.Event<E>
    ) {
        const { target, key } = event;
        if (!target._handlers[key]) {
            target._handlers[key] = [];
        }
        target._handlers[key].push([ 
            this, 
            handler
        ]);
        
        if (!this._emitters.has(handler)) {
            this._emitters.set(handler, []);
        }
        this._emitters.get(handler)?.push(event);

        console.log(event.key, handler);
        if (key === target.event.stateCheck.key) {
            target._onStateReset();
        }
    }

    @Model.useDebugger(false)
    protected _unbind<E>(
        event: IEvent<E>,
        handler: Base.Event<E>
    ) {
        const { target, key } = event;
        const handlers = target._handlers[key];
        if (handlers) {
            while (true) {
                const index = handlers.findIndex(
                    item => item[0] === this && item[1] === handler
                );
                if (index < 0) break;
                handlers?.splice(index, 1);
            }
        }
        const emitters = this._emitters.get(handler);
        console.log(this.id, event.key, emitters);
        if (emitters) {
            while (true) {
                const index = emitters.indexOf(event);
                if (index < 0) break;
                emitters.splice(index, 1);
            }
            this._emitters.set(handler, emitters);
        }
        if (key === target.event.stateCheck.key) {
            target._onStateReset();
        }
    }

    @Model.useDebugger(true)
    protected _unbindHandler<E>(
        handler: Base.Event<E>
    ) {
        const emitters = this._emitters.get(handler);
        console.log(emitters);
        for (const event of [ ...emitters || [] ]) {
            this._unbind(event, handler);
        }
    }

    @Model.useDebugger(false)
    protected _emit<E>(
        event: IEvent<E>,
        param: E
    ) {
        const handlers = this._handlers[event.key];
        for (const [ target, handler ] of [ ...handlers || [] ]) {
            const result = handler.call(target, param);
            if (result) param = result;
        }
        return param;
    }

    readonly event: Readonly<{
        [K in KeyOf<Def.Event<T>>]: IEvent<Def.Event<T>[K]>
    }> & {
        stateUpdate: IEvent<{
            target: Model<T>, 
            prev: Model.State<Model<T>>,
            next: Model.State<Model<T>>,
        }>,
        stateCheck: IEvent<{
            target: Model<T>,
            prev: Model.State<Model<T>>,
            next: Model.State<Model<T>>,
            isBreak?: boolean
        }>,
        childUpdate: IEvent<{
            target: Model<T>,
            next: Model.Child<Model<T>>,
        }>,
    } = Delegator.Automic<any>((key) => {
        return new IEvent(this, key);
    });

    private readonly _loaders: Base.Func[] = [];
    private _load() {
        for (const loader of [ ...this._loaders ]) loader();
      
        const child: Model[] = [];
        for (const key in this._childDict) {
            const _key: KeyOf<Def.ChildDict<T>> = key;
            const value = this._childDict[_key];
            if (!value) continue;
            child.push(value);
        }
        for (const key in this._childList) {
            const _key: KeyOf<Def.ChildList<T>> = key;
            const value = this._childList[_key];
            if (!value) continue;
            child.push(...value);
        }
        for (const target of child) {
            target._load();
        }
    }

    private readonly _unloaders: Base.Func[] = [];
    @Model.useDebugger(false)
    private _unload() {
        for (const unloader of [ ...this._unloaders ]) unloader();

        for (const refer of [ ...this._refers ]) {
            refer._unconnect(this);
        }

        const child: Model[] = [];
        for (const key in this._childDict) {
            const _key: KeyOf<Def.ChildDict<T>> = key;
            const value = this._childDict[_key];
            if (!value) continue;
            child.push(value);
        }
        for (const key in this._childList) {
            const _key: KeyOf<Def.ChildList<T>> = key;
            const value = this._childList[_key];
            if (!value) continue;
            child.push(...value);
        }
        for (const target of child) {
            target._unload();
        }

        for (const key in this._handlers) {
            const handlers = this._handlers[key];
            for (const [ target, handler ] of [ ...handlers || [] ]) {
                target._unbind(this.event[key], handler);
            }
        }
        for (const handler of [ ...this._emitters.keys() ]) {
            const emitters = this._emitters.get(handler);
            for (const event of [ ...emitters || [] ]) {
                if (event.key === 'stateGet') {
                    console.log(event.target.id);
                }
                this._unbind(event, handler);
            }
        }

        this.debug();
    }
    
    get seq(): Seq<T> {
        const childDict: any = {};
        const childList: any = {};
        for (const key in this._childDict) {
            const _key: KeyOf<Def.ChildDict<T>> = key;
            const value = this._childDict[_key];
            if (!value) continue;
            childDict[_key] = value.seq;
        }
        for (const key in this._childList) {
            const _key: KeyOf<Def.ChildList<T>> = key;
            const value = this._childList[_key];
            if (!value) continue;
            childList[_key] = value.map(target => target.seq);
        }

        return {
            id: this.id,
            type: this.type,
            memoState: { ...this._memoState },
            childDict,
            childList
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

    @Model.useDebugger(true)
    public debug() {
        console.log(this._handlers);
        console.log({ ...this.state });
        console.log({ ...this._state });
    }
}
