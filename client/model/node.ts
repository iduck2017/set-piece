import { Factory } from "@/service/factory";
import { Lifecycle } from "@/service/lifecycle";
import { Base, KeyOf, Strict, ValidOf } from "@/type/base";
import { Event, React } from "@/util/event";
import { Delegator } from "@/util/proxy";
import { OptionalKeys, RequiredKeys } from "utility-types";

export type ChunkOf<N extends Node> = N['chunk'] 

export interface Chunk<
    T extends string = string,
    S extends Base.Data = any,
    C extends Node | Record<string, Node> = any
> {
    type: T;
    uuid?: string;
    state?: Partial<S>;  
    child?: 
        C extends Node ? ChunkOf<C>[] : 
        C extends Record<string, Node>? Strict<{
            [K in KeyOf<ValidOf<C>>]?: ChunkOf<Required<C>[K]>;
        }> : never
}

export abstract class Node<
    T extends string = string,
    S extends Base.Data = Base.Data,
    C extends Node | Record<string, Node> = any,
    E extends Record<string, Base.Func> = Record<string, Base.Func>
> {
    public readonly type: T;
    public readonly uuid: string;
    public readonly parent?: Node;

    protected _state: S;
    public get state(): Readonly<S> {
        return { ...this._state };
    }
    
    protected _child: 
        C extends Node ? ChunkOf<C>[] : 
        C extends Record<string, Node>? Strict<{
            [K in RequiredKeys<ValidOf<C>>]: ChunkOf<C[K]>;
        } & {
            [K in OptionalKeys<ValidOf<C>>]?: ChunkOf<Required<C>[K]>; 
        }> : never;
    protected child: Readonly<C extends Node ? C[] : C>;

    protected _event: E;
    public event: Readonly<Strict<{
        [K in KeyOf<ValidOf<E>>]: Event<E[K]>;
    }>>;

    constructor(
        chunk: {
            type: T;
            uuid?: string;
            state: S;
            child: 
                C extends Node ? ChunkOf<C>[] : 
                C extends Record<string, Node>? Strict<{
                    [K in RequiredKeys<ValidOf<C>>]: ChunkOf<C[K]>;
                } & {
                    [K in OptionalKeys<ValidOf<C>>]?: ChunkOf<Required<C>[K]>; 
                }> : never,
            event?: {
                [K in KeyOf<ValidOf<E>>]?: Event<E[K]>;
            }
        },
        parent?: Node
    ) {
        this.type = chunk.type;
        this.uuid = chunk.uuid || Factory.uuid;
        this.parent = parent;

        this._state = chunk.state;

        let child: any;
        if (chunk.child instanceof Array) {
            child = chunk.child.map(chunk => this.create(chunk));
        } else {
            child = {};
            for (const key in chunk.child) {
                const value = chunk.child[key];
                if (value instanceof Node) {
                    child[key] = this.create(value);
                }
            }
        }
        child = Delegator.Controlled(
            child,
            this._onChildSet.bind(this)
        );
        this.child = Delegator.Readonly(child);
        this._child = Delegator.Formatted(
            child,
            (node: Node) => node.chunk,
            (chunk: Chunk) => this.create(chunk) 
        );

        this._event = Delegator.Automic({}, (key: any) => {
            const _key: KeyOf<ValidOf<E>> = key;
            const result: any = (...args: any[]) => {
                const event = this.event[_key];
                const { target } = event;
                const reacts = target._consumers.get(event) || [];
                for (const react of reacts) {
                    react.handler.apply(react.target, ...args);
                }
            };
            return result;
        });
        this.event = Delegator.Automic(chunk.event || {}, () => {
            const result: any = new Event(this);
            return result;  
        });
    }


    private _onChildSet(event: {
        key: string,
        prev?: Node | Node[],
        next?: Node | Node[]
    }) {
        const { prev, next } = event;
        if (next instanceof Array) next.map(target => target._load());
        if (prev instanceof Array) prev.map(target => target._unload());
        if (next instanceof Node) next._load();
        if (prev instanceof Node) prev._unload();
    }

    protected create<N extends Node>(
        chunk: ChunkOf<N>
    ): N {
        const Type = Factory.products[chunk.type];
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

    protected bind<E extends Base.Func>(
        event: Event<E>,
        handler: E
    ) {
        const { target } = event;
        const react = this._react.get(handler) || new React(this, handler);
        this._react.set(handler, react);

        const reacts = target._consumers.get(event) || [];
        reacts.push();
        target._consumers.set(event, reacts);
        const events = this._producers.get(react) || [];
        events.push(event);
        this._producers.set(react, events);
    }
    protected unbind<E extends Base.Func>(
        event: Event<E> | undefined,
        handler: E
    ) {
        const react = this._react.get(handler);
        if (react) {
            const events = this._producers.get(react) || [];
            for (const _event of events) {
                if (event && _event !== event) continue;
                const { target } = _event;
                const reacts = target._consumers.get(_event) || [];
                while (true) {
                    const index = reacts.indexOf(react);
                    if (index < 0) break;
                    reacts.splice(index, 1);
                }
                target._consumers.set(_event, reacts);
            }
            this._producers.delete(react);
        }
    }
    
    private readonly _loaders: Base.Func[] = Lifecycle.getLoaders(this);
    private readonly _unloaders: Base.Func[] = Lifecycle.getUnloaders(this);
    private _load() {
        for (const loader of this._loaders) loader();
        if (this.child instanceof Array) {
            for (const node of this.child) node._load();
        } else {
            for (const key in this.child) {
                const node = this.child[key];
                if (node instanceof Node) node._load();
            }
        }
    }
    private _unload() {
        for (const unloader of this._unloaders) unloader();
        if (this.child instanceof Array) {
            for (const node of this.child) node._unload();
        } else {
            for (const key in this.child) {
                const node = this.child[key];
                if (node instanceof Node) node._unload();
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
    }

    public debug() {
        console.log(this._consumers);
        console.log({ ...this._state });
    }

    get chunk(): Chunk<T, S, C> {
        let child: any;
        if (this.child instanceof Array) {
            child = this.child.map(node => node.chunk);
        } else {
            child = {};
            for (const key in this.child) {
                const value = this.child[key];
                if (value instanceof Node) {
                    child[key] = value.chunk; 
                }
            }
        }
        return {
            type: this.type,
            uuid: this.uuid,
            state: { ...this._state },
            child
        };
    }
}
