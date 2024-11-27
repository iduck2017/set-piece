import { Decor } from "@/service/decor";
import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";
import { Logger } from "@/service/logger";
import { Base, KeyOf, Strict, ValidOf } from "@/type/base";
import { Chunk, ChunkOf, StateOf } from "@/type/model";
import { Event, React } from "@/util/event";
import { Delegator } from "@/util/proxy";
import { OptionalKeys, RequiredKeys } from "utility-types";

type ModelEvent<
    E extends Record<string, Base.Func> = Record<string, Base.Func>
> = {
    onNodeAlter: <N extends Model>(target: N, form: {
        prev: Readonly<StateOf<N>>,
        next: Readonly<StateOf<N>>,
    }) => void;
    onNodeCheck: <N extends Model>(target: N, form: {
        prev: Readonly<StateOf<N>>,
        next: StateOf<N>,
    }) => void;
    onNodeSpawn: <N extends Model>(target: N) => void;
} & E;

export type Model = IModel<
    string,
    Base.Data,
    any,
    Record<string, Base.Func>
>;

export abstract class IModel<
    T extends string,
    S extends Base.Data,
    C extends Model | Record<string, Model>,
    E extends Record<string, Base.Func>
> {
    public readonly templ: T;
    
    public readonly refer: string;
    private readonly _refer: Record<string, Model> = {};

    public readonly parent?: Model;

    protected _state: S;
    public get state(): Readonly<S> {
        return { ...this._prevState };
    }
    
    protected _event: ModelEvent<E>;
    public readonly event: Readonly<Strict<{
        [K in KeyOf<ValidOf<ModelEvent<E>>>]: Event<ModelEvent<E>[K]>;
    }>>;

    protected _child: 
        C extends Model ? ChunkOf<C>[] : 
        C extends Record<string, Model>? Strict<{
            [K in RequiredKeys<ValidOf<C>>]: ChunkOf<C[K]>;
        } & {
            [K in OptionalKeys<ValidOf<C>>]?: ChunkOf<Required<C>[K]>; 
        }> : never;
    public readonly child: Readonly<C extends Model ? C[] : C>;

    constructor(
        chunk: {
            templ: T;
            refer?: string;
            state: S;
            child: 
                C extends Model ? ChunkOf<C>[] : 
                C extends Record<string, Model>? Strict<{
                    [K in RequiredKeys<ValidOf<C>>]: ChunkOf<C[K]>;
                } & {
                    [K in OptionalKeys<ValidOf<C>>]?: ChunkOf<Required<C>[K]>; 
                }> : never,
            event?: {
                [K in KeyOf<ValidOf<E>>]?: Event<E[K]>;
            }
        },
        parent?: Model
    ) {
        this.templ = chunk.templ;
        this.refer = chunk.refer || Factory.refer;
        this.parent = parent;
        if (parent) {
            parent._refer[this.refer] = this;
        }

        this._state = Delegator.Observed(
            chunk.state,
            this._onNodeAlter.bind(this, false)
        );
        this._prevState = { ...this._state };

        this._event = Delegator.Automic({}, (key: any) => {
            const result: any = this._emit.bind(this, key);
            return result;
        });
        this.event = Delegator.Automic(chunk.event || {}, () => {
            const result: any = new Event(this);
            return result;  
        });

        let child: any;
        if (chunk.child instanceof Array) {
            child = chunk.child.map(chunk => this._create(chunk));
        } else {
            child = {};
            for (const key in chunk.child) {
                const value = chunk.child[key];
                if (value instanceof IModel) {
                    child[key] = this._create(value);
                }
            }
        }
        child = Delegator.Observed(
            child,
            this._onNodeSpawn.bind(this)
        );
        this.child = Delegator.Readonly(child);
        this._child = Delegator.Formatted(
            child,
            (model: Model) => model.chunk,
            (chunk: Chunk) => this._create(chunk) 
        );

    }

    @Logger.useDebug(true)
    private _emit(key: KeyOf<ValidOf<ModelEvent<E>>>, ...args: any[]) {
        const event = this.event[key];
        const { target } = event;
        const reacts = target._consumers.get(event) || [];
        for (const react of reacts) {
            react.handler.apply(react.target, args);
        }
    }

    private _prevState: S;
    protected _onNodeAlter(recursive?: boolean) {
        const prevState = { ...this._prevState };
        const nextState = { ...this._state };
        this._event.onNodeCheck(this, {
            prev: prevState,
            next: nextState
        });
        this._prevState = { 
            ...this._state,
            ...Decor.getDecors(this, nextState)
        };
        this._event.onNodeAlter(this, {
            prev: prevState,
            next: nextState
        });
        if (recursive) {
            if (this.child instanceof Array) {
                for (const target of this.child) target._onNodeAlter(recursive);
            } else {
                for (const key in this.child) {
                    const target = this.child[key];
                    if (target instanceof IModel) target._onNodeAlter(recursive);
                }
            }
        }
    }
    public useState<N extends Model>(setter: (target: N) => void){
        const event: any = this.event;
        this.bind(event.onNodeAlter, setter);
        return () => {
            this.unbind(event.onNodeAlter, setter);
        };
    }

    private _onNodeSpawn(event: {
        key: string,
        prev?: Model | Model[],
        next?: Model | Model[]
    }) {
        const { prev, next } = event;
        if (next instanceof Array) next.map(target => target._load());
        if (prev instanceof Array) prev.map(target => target._unload());
        if (next instanceof IModel) next._load();
        if (prev instanceof IModel) prev._unload();
        this._event.onNodeSpawn(this);
    }
    public useChild<N extends Model>(setter: (target: N) => void) {
        const event: any = this.event;
        this.bind(event.onNodeSpawn, setter);
        return () => {
            this.unbind(event.onNodeSpawn, setter);
        };
    }

    private _create<N extends Model>(
        chunk: ChunkOf<N>
    ): N {
        const Type = Factory.products[chunk.templ];
        if (!Type) {
            console.error('ModelNotFound:', {
                chunk
            });
            throw new Error();
        }
        return new Type(chunk, this) as N;
    }

    private readonly _react: Map<Base.Func, React> = new Map();
    private readonly _consumers: Map<Event, Array<React>> = new Map();
    private readonly _producers: Map<React, Array<Event>> = new Map();

    @Logger.useDebug(true)
    protected bind<E extends Base.Func>(
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
        if (event === target.event.onNodeCheck) {
            target._onNodeAlter(true);
        }
    }

    protected unbind<E extends Base.Func>(
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
                if (_event === target.event.onNodeCheck) {
                    target._onNodeAlter(true);  
                }
            }
            this._producers.delete(react);
        }
    }

    
    public get path(): string[] {
        const result: string[] = [ this.refer ];
        let temp: Model | undefined = this.parent;
        while (temp) {
            result.unshift(temp.refer);
            temp = temp.parent;
        }
        return result;
    }
    public query(path: string[]): Model | undefined {
        for (const segment of path) {
            if (this._refer[segment]) {
                return this._refer[segment].query(path.slice(
                    path.indexOf(segment) + 1
                ));
            }
        }
        return undefined;
    }

    private readonly _loaders: Base.Func[] = Lifecycle.getLoaders(this);
    private readonly _unloaders: Base.Func[] = Lifecycle.getUnloaders(this);
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
            delete this.parent._refer[this.refer];
        }
    }

    public debug() {
        console.log(this._consumers);
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
            templ: this.templ,
            refer: this.refer,
            state: { ...this._state },
            child
        };
    }
}
