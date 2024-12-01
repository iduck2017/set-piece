import { Decor } from "@/service/decor";
import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";
import { Logger } from "@/service/logger";
import { KeyOf, Func, HarshOf, ValidOf, Value, Dict, List } from "@/type/base";
import { Emitter, Event, React, Handler, 
    OnModelAlter, OnModelCheck, OnModelSpawn } from "@/type/event";
import { Chunk, ChunkOf } from "@/type/model";
import { Delegator } from "@/util/proxy";
import { OptionalKeys, RequiredKeys } from "utility-types";

type ModelEvent<M extends Model> = {
    onModelAlter: OnModelAlter<M>
    onModelCheck: OnModelCheck<M>
    onModelSpawn: OnModelSpawn<M>
}

export type Model<
    T extends string = string,
    S extends Dict<Value> = Dict<Value>,
    C extends Dict<Model> | List<Model> = any,
    E extends Dict = Dict
> = IModel<T, S, C, E>;

export abstract class IModel<
    T extends string,
    S extends Dict<Value>,
    C extends Dict<Model> | List<Model>,
    E extends Dict
> {
    public readonly code: T;
    public readonly uuid: string;

    public readonly parent?: Model;

    protected _state: HarshOf<S>;
    public get state(): Readonly<HarshOf<S>> {
        return { ...this._prevState };
    }
    private _prevState: HarshOf<S>;

    protected _event: Readonly<HarshOf<{
        [K in KeyOf<E>]: Emitter<Required<E>[K]>
    }>>;
    public readonly event: Readonly<HarshOf<{
        [K in KeyOf<ModelEvent<typeof this> & E>]: 
            Event<(ModelEvent<typeof this> & E)[K]>;
    }>>;
    private _baseEvent: Readonly<{
        [K in KeyOf<ModelEvent<typeof this>>]: 
            Emitter<ModelEvent<typeof this>[K]>
    }>;

    protected _child: 
        C extends List ? ChunkOf<C[number]>[] : 
        C extends Dict ? HarshOf<{
            [K in RequiredKeys<ValidOf<C>>]: ChunkOf<C[K]>;
        } & {
            [K in OptionalKeys<ValidOf<C>>]?: ChunkOf<Required<C>[K]>; 
        }> : never;
    public readonly child: Readonly<HarshOf<C>>;

    constructor(
        chunk: {
            code: T;
            uuid?: string;
            state: HarshOf<S>;
            child: 
                C extends List ? ChunkOf<C[number]>[] : 
                C extends Dict ? HarshOf<{
                    [K in RequiredKeys<ValidOf<C>>]: ChunkOf<C[K]>;
                } & {
                    [K in OptionalKeys<ValidOf<C>>]?: ChunkOf<Required<C>[K]>; 
                }> : never,
            event?: {
                [K in KeyOf<ValidOf<ModelEvent<Model<T, S, C, E>> & E>>]?: 
                    Event<(ModelEvent<Model<T, S, C, E>> & E)[K]>[];
            }
        },
        parent: Model | undefined
    ) {
        this.code = chunk.code;
        this.uuid = chunk.uuid || Factory.uuid;
        this.parent = parent;
        if (parent) {
            parent._refers[this.uuid] = this;
        }

        this._state = Delegator.Observed(
            chunk.state,
            this._onModelAlter.bind(this, false)
        );
        this._prevState = { ...this._state };

        this._event = Delegator.Automic({}, (key) => {
            const result: any = this._emit.bind(this, key);
            return result;
        });
        this._baseEvent = Delegator.Automic({}, key => {
            return this._emit.bind(this, key);
        });
        this.event = Delegator.Automic({}, (key) => {
            const _result: Event = { 
                target: this,
                uuid: Factory.uuid,
                key,
                alias: []
            };
            const result: any = _result;
            return result;  
        });
        for (const key in chunk.event) {
            const event: any = chunk.event;
            const value = event[key];
            this.event[key].alias = value;
        }

        let child: any;
        if (chunk.child instanceof Array) {
            child = chunk.child.map(chunk => this._create(chunk));
        } else {
            child = {};
            for (const key in chunk.child) {
                const value: any = chunk.child[key];
                child[key] = this._create(value);
            }
        }
        child = Delegator.Observed(
            child,
            this._onModelSpawn.bind(this)
        );
        this.child = Delegator.Readonly(child);
        this._child = Delegator.Formatted(
            child,
            (model: Model) => model.chunk,
            (chunk: Chunk) => this._create(chunk) 
        );

    }

    private _emit<K extends KeyOf<ModelEvent<typeof this> & E>>(
        key: K, 
        data: (ModelEvent<typeof this> & E)[K]
    ) {
        const events = [
            this.event[key],
            ...this.event[key].alias
        ];
        let temp = data;
        for (const event of events) {
            const { target } = event;
            const reacts = target._consumers.get(event) || [];
            for (const react of reacts) {
                const result = react.handler.call(react.target, this, temp);
                if (result !== undefined) {
                    temp = result;
                }
            }
        }
        return temp;
    }
    @Logger.useDebug(true)
    protected _onModelAlter(recursive?: boolean) {
        const prevData = {
            target: this,
            prev: { ...this._prevState },
            next: { ...this._state }
        };
        const nextData = this._baseEvent.onModelCheck(prevData);
        // console.log(
        //     this, 
        //     { ...prevData.prev },
        //     { ...nextData.next },
        //     Decor.GetMutators(this, nextData.next)
        // );
        this._prevState = { 
            ...this._state,
            ...Decor.GetMutators(this, nextData.next)
        };
        this._baseEvent.onModelAlter({
            target: this,
            prev: nextData.prev,
            next: nextData.next
        });
        if (recursive) {
            if (this.child instanceof Array) {
                for (const target of this.child) {
                    target._onModelAlter(recursive);
                }
            } else {
                for (const key in this.child) {
                    const target = this.child[key];
                    if (target instanceof IModel) {
                        target._onModelAlter(recursive);
                    }
                }
            }
        }
    }
    public useState(setter: Handler<OnModelAlter<typeof this>>){
        const event: {
            [K in KeyOf<ModelEvent<typeof this>>]: 
                Event<ModelEvent<typeof this>[K]>
        } = this.event;
        this.bind(event.onModelAlter, setter);
        return () => {
            this.unbind(event.onModelAlter, setter);
        };
    }

    private _onModelSpawn(detail: {
        key: string,
        prev?: Model | Model[],
        next?: Model | Model[]
    }) {
        const { prev, next } = detail;
        if (next instanceof Array) next.map(target => target._load());
        if (prev instanceof Array) prev.map(target => target._unload());
        if (next instanceof IModel) next._load();
        if (prev instanceof IModel) prev._unload();
        this._baseEvent.onModelSpawn({
            target: this,
            next: this.child
        });
    }
    public useChild(setter: Handler<OnModelSpawn<typeof this>>) {
        const event: {
            [K in KeyOf<ModelEvent<typeof this>>]: 
                Event<ModelEvent<typeof this>[K]>
        } = this.event;
        this.bind(event.onModelSpawn, setter);
        return () => {
            this.unbind(event.onModelSpawn, setter);
        };
    }

    private _create<N extends Model>(
        chunk: ChunkOf<N>
    ): N {
        const Type = Factory.products[chunk.code];
        if (!Type) {
            console.error('ModelNotFound:', {
                chunk
            });
            throw new Error();
        }
        const instance: N = new Type(chunk, this);
        return instance;
    }

    private readonly _react: Map<Func, React> = new Map();
    private readonly _consumers: Map<Event, Array<React>> = new Map();
    private readonly _producers: Map<React, Array<Event>> = new Map();

    @Logger.useDebug(true)
    protected bind<E>(
        event: Event<E>,
        handler: Handler<E>
    ) {
        const { target } = event;
        const react: React = this._react.get(handler) || {
            target: this,
            uuid: Factory.uuid,
            handler
        };
        this._react.set(handler, react);

        const reacts = target._consumers.get(event) || [];
        reacts.push(react);
        target._consumers.set(event, reacts);
        const events = this._producers.get(react) || [];
        events.push(event);
        this._producers.set(react, events);
        if (event.key.endsWith('Check')) {
            console.log(event.key, event);
            target._onModelAlter(true);
        }
    }

    protected unbind<E>(
        event: Event<E> | undefined,
        handler: Handler<E>
    ) {
        const react = this._react.get(handler);
        if (react) {
            const _events = this._producers.get(react) || [];
            for (const _event of _events) {
                if (event && _event !== event) continue;
                const { target } = _event;
                const reacts = target._consumers.get(_event) || [];
                while (true) {
                    const index = reacts.indexOf(react);
                    if (index < 0) break;
                    reacts.splice(index, 1);
                }
                target._consumers.set(_event, reacts);
                if (_event.key.endsWith('Check')) {
                    target._onModelAlter(true);
                }
            }
            this._producers.delete(react);
        }
    }

    private readonly _refers: Record<string, Model> = {};
    public get path(): string[] {
        const result: string[] = [ this.uuid ];
        let temp: Model | undefined = this.parent;
        while (temp) {
            result.unshift(temp.uuid);
            temp = temp.parent;
        }
        return result;
    }
    public query(refer: string[]): Model | undefined {
        for (const uuid of refer) {
            if (this._refers[uuid]) {
                return this._refers[uuid].query(refer.slice(
                    refer.indexOf(uuid) + 1
                ));
            }
        }
        return undefined;
    }

    private readonly _loaders: Func[] = Lifecycle.getLoaders(this);
    private readonly _unloaders: Func[] = Lifecycle.getUnloaders(this);
    private _load() {
        for (const loader of this._loaders) {
            loader.call(this);
        }
        if (this.child instanceof Array) {
            for (const child of this.child) {
                child?._load();
            }
        } else {
            for (const key in this.child) {
                const child = this.child[key];
                if (child instanceof IModel) {
                    child._load();
                }
            }
        }
    }
    private _unload() {
        for (const [ event, reacts ] of this._consumers) {
            for (const react of reacts) {
                const { target, handler } = react;
                target.unbind(event, handler);
            } 
        }
        for (const [ react ] of this._producers) {
            this.unbind(undefined, react.handler);
        }
        for (const unloader of this._unloaders) {
            unloader.call(this);
        }
        if (this.child instanceof Array) {
            for (const child of this.child) {
                child?._unload();
            }
        } else {
            for (const key in this.child) {
                const child = this.child[key];
                if (child instanceof IModel) {
                    child._unload();
                }
            }
        }
        if (this.parent) {
            delete this.parent._refers[this.uuid];
        }
    }

    @Logger.useDebug(true)
    public debug() {
        if (this.child instanceof Array) {
            console.log([ ...this.child ]);
        } else {
            console.log({ ...this.child });
        }
        console.log({ ...this._state });
        console.log({ ...this.event });
    }

    get chunk(): Chunk<T, S, C> {
        const child: any = 
            this._child instanceof Array ?
                [ ...this._child ] :
                { ...this._child };
        return {
            code: this.code,
            uuid: this.uuid,
            state: { ...this._state },
            child
        };
    }
}
