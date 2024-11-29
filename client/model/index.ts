import { Decor } from "@/service/decor";
import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";
import { Logger } from "@/service/logger";
import { KeyOf, Method, Strict, ValidOf, Value } from "@/type/base";
import { Chunk, ChunkOf, OnModelAlter, OnModelCheck, OnModelSpawn } from "@/type/model";
import { Event, React } from "@/util/event";
import { Delegator } from "@/util/proxy";
import { OptionalKeys, RequiredKeys } from "utility-types";

type ModelEvent<
    M extends Model,
    E extends Record<string, Method> = Record<string, Method>
> = {
    onModelAlter: OnModelAlter<M>
    onModelCheck: OnModelCheck<M>
    onModelSpawn: OnModelSpawn<M>
} & E;

export type Model<
    T extends string = string,
    S extends Record<string, Value> = Record<string, Value>,
    C extends Record<string, Model> | Model[] = Record<string, any>,
    E extends Record<string, any> = Record<string, any>
> = IModel<T, S, C, E>;

export abstract class IModel<
    T extends string,
    S extends Record<string, Value>,
    C extends Record<string, Model> | Model[],
    E extends Record<string, any>
> {
    public readonly code: T;
    public readonly uuid: string;

    public readonly parent?: Model;

    protected _state: Strict<S>;
    public get state(): Readonly<Strict<S>> {
        return { ...this._prevState };
    }
    
    protected _event: Readonly<Strict<{
        [K in KeyOf<ValidOf<ModelEvent<typeof this, E>>>]: 
            (event: ModelEvent<typeof this, E>[K]) => void;
    }>>;
    public readonly event: Readonly<Strict<{
        [K in KeyOf<ValidOf<ModelEvent<typeof this, E>>>]: 
            Event<ModelEvent<typeof this, E>[K]>;
    }>>;

    protected _child: 
        C extends Array<any> ? ChunkOf<C[number]>[] : 
        C extends Record<string, any> ? Strict<{
            [K in RequiredKeys<ValidOf<C>>]: ChunkOf<C[K]>;
        } & {
            [K in OptionalKeys<ValidOf<C>>]?: ChunkOf<Required<C>[K]>; 
        }> : never;
    public readonly child: Readonly<Strict<C>>;

    constructor(
        chunk: {
            code: T;
            uuid?: string;
            state: Strict<S>;
            child: 
                C extends Array<any> ? ChunkOf<C[number]>[] : 
                C extends Record<string, any> ? Strict<{
                    [K in RequiredKeys<ValidOf<C>>]: ChunkOf<C[K]>;
                } & {
                    [K in OptionalKeys<ValidOf<C>>]?: ChunkOf<Required<C>[K]>; 
                }> : never,
            event?: {
                [K in KeyOf<ValidOf<ModelEvent<Model<T, S, C, E>, E>>>]?: 
                    Event<ModelEvent<Model<T, S, C, E>, E>[K]>[];
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

        this._event = Delegator.Automic({}, (key: any) => {
            const result: any = this._emit.bind(this, key);
            return result;
        });
        this.event = Delegator.Automic(chunk.event || {}, (key) => {
            const result: any = new Event(this, key);
            return result;  
        });

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

    @Logger.useDebug(true)
    private _emit(
        key: KeyOf<ValidOf<ModelEvent<typeof this, E>>>, 
        ...args: any[]
    ) {
        const event = this.event[key];
        const { target } = event;
        const reacts = target._consumers.get(event) || [];
        for (const react of reacts) {
            react.handler.apply(react.target, args);
        }
    }

    private _prevState: Strict<S>;
    protected _onModelAlter(recursive?: boolean) {
        const prevState = { ...this._prevState };
        const nextState = { ...this._state };
        const event: any = this._event;
        event.onModelCheck({
            target: this,
            prev: prevState,
            next: nextState
        });
        this._prevState = { 
            ...this._state,
            ...Decor.GetMutators(this, nextState)
        };
        event.onModelAlter({
            target: this,
            prev: prevState,
            next: nextState
        });
        if (recursive) {
            if (this.child instanceof Array) {
                for (const target of this.child) target._onModelAlter(recursive);
            } else {
                for (const key in this.child) {
                    const target = this.child[key];
                    if (target instanceof IModel) target._onModelAlter(recursive);
                }
            }
        }
    }
    public useState(setter: (detail: OnModelAlter<typeof this>) => void){
        const event: any = this.event;
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
        const event: any = this._event;
        event.onModelSpawn({
            target: this,
            next: this.child
        });
    }
    public useChild(setter: (detail: OnModelSpawn<typeof this>) => void) {
        const event: any = this.event;
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
        return new Type(chunk, this) as N;
    }

    private readonly _react: Map<Method, React> = new Map();
    private readonly _consumers: Map<Event, Array<React>> = new Map();
    private readonly _producers: Map<React, Array<Event>> = new Map();

    @Logger.useDebug(true)
    protected bind<E extends Method>(
        event: Event<E>,
        handler: E
    ) {
        const { target } = event;
        const react = this._react.get(handler) || new React(this, handler);
        this._react.set(handler, react);

        const reacts = target._consumers.get(event) || [];
        reacts.push(react);
        target._consumers.set(event, reacts);
        const events = this._producers.get(react) || [];
        events.push(event);
        this._producers.set(react, events);
        if (event === target.event.onModelCheck) {
            target._onModelAlter(true);
        }
    }

    protected unbind<E extends Method>(
        event: Event<E> | undefined,
        handler: E
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
                if (_event === target.event.onModelCheck) {
                    target._onModelAlter(true);  
                }
            }
            this._producers.delete(react);
        }
    }

    private readonly _refers: Record<string, Model> = {};
    public get refer(): string[] {
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

    private readonly _loaders: Method[] = Lifecycle.getLoaders(this);
    private readonly _unloaders: Method[] = Lifecycle.getUnloaders(this);
    private _load() {
        for (const loader of this._loaders) loader();
        if (this.child instanceof Array) {
            for (const target of this.child) target._load();
        } else {
            for (const key in this.child) {
                const target = this.child[key];
                if (target instanceof IModel) target._load();
            }
        }
    }
    private _unload() {
        for (const unloader of this._unloaders) unloader();
        if (this.child instanceof Array) {
            for (const target of this.child) target._unload();
        } else {
            for (const key in this.child) {
                const target = this.child[key];
                if (target instanceof IModel) target._unload();
            }
        }
        for (const [ event, reacts ] of this._consumers) {
            for (const react of reacts) {
                const { target, handler } = react;
                target.unbind(event, handler);
            } 
        }
        for (const [ react ] of this._producers) {
            this.unbind(undefined, react.handler);
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
        if (this._child instanceof Array) {
            console.log([ ...this._child ]);
        } else {
            console.log({ ...this._child });
        }
        console.log({ ...this._state });
    }

    get chunk(): Chunk<T, S, C> {
        let child: any;
        if (this.child instanceof Array) {
            child = this.child.map(target => target.chunk);
        } else {
            child = {};
            for (const key in this.child) {
                const value = this.child[key];
                if (value instanceof IModel) {
                    child[key] = value.chunk; 
                }
            }
        }
        return {
            code: this.code,
            uuid: this.uuid,
            state: { ...this._state },
            child
        };
    }
}
