import { Base, KeyOf, Strict, ValidOf } from "@/type/base";
import { OptionalKeys, RequiredKeys } from "utility-types";

export type ChunkOf<N extends Node> = N['chunk'] 

interface NodeChunk<
    T extends string,
    S extends Base.Data,
    C extends Node | Record<string, Node>
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

abstract class Node<
    T extends string = string,
    S extends Base.Data = Base.Data,
    C extends Node | Record<string, Node> = any
> {
    public readonly type: T;
    public readonly uuid: string;
    public readonly parent: Node;

    protected _state: S;
    public get state(): S {
        return { ...this._state };
    }

    protected _child: C extends Node ? C[] : C;

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
                }> : never
        },
        parent: Node
    ) {
        this.type = chunk.type;
        this.uuid = chunk.uuid || Node.uuid;
        this.parent = parent;
        
        this._state = chunk.state;

        let child: any;
        if (chunk.child instanceof Array) {
            child = chunk.child.map(chunk => this.create(chunk));
        } else {
            child = {};
            for (const key in chunk.child) {
                const value: any = chunk.child[key];
                if (value) {
                    child[key] = this.create(value);
                }
            }
        }
        this._child = child;

        let constructor: any = this.constructor;
        while (constructor.__proto__ !== null) {
            for (const key of Node._.get(constructor) || []) {
                const loader: any = Reflect.get(this, key);
                this._loaders.push(loader.bind(this));
            }
            for (const key of Node._unloaders.get(constructor) || []) {
                const unloader: any = Reflect.get(this, key);
                this._unloaders.push(unloader.bind(this));
            }
            constructor = constructor.__proto__;
        }
    }

    protected abstract _traverse(handler: (node: Node) => void): void;
    protected create<N extends Node>(
        chunk: ChunkOf<N>
    ): N {
        const Type = Node._products[chunk.type];
        if (!Type) {
            console.error('ModelNotFound:', {
                chunk
            });
            throw new Error();
        }
        return new Type(chunk, this) as N;
    }
    

    private readonly _handlers: Record<string, [Node, Base.Func][]> = {};
    private readonly _emitters: Map<Base.Func, Array<{
        node: Node;
        key: string;
    }>> = new Map();

    get chunk(): NodeChunk<T, S, C> {
        let child: any;
        if (this._child instanceof Array) {
            child = this._child.map(node => node.chunk);
        } else {
            child = {};
            for (const key in this._child) {
                const value = this._child[key];
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

    private readonly _loaders: Base.Func[] = [];
    private readonly _unloaders: Base.Func[] = [];
    private _destroy() {
        this._traverse(node => {
            const unloaders = [ ...this._unloaders ];
            for (const unloader of unloaders) {
                unloader(node);
            }
        });        
    }
    private static readonly _loaders: Map<Function, string[]> = new Map();
    private static readonly _unloaders: Map<Function, string[]> = new Map();
    protected static useLoader() {
        return function(
            target: Node,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const keys = Node._loaders.get(target.constructor) || [];
            keys.push(key);
            Node._loaders.set(target.constructor, keys);
            return descriptor;
        };
    }
    protected static useUnloader() {
        return function(
            target: Node,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const keys = Node._unloaders.get(target.constructor) || [];
            keys.push(key);
            Node._unloaders.set(target.constructor, keys);
            return descriptor;
        };
    }

    private static _timestamp = Date.now(); 
    private static _uuid = 36 ** 2;
    private static _instances: Record<string, Node> = {};
    protected static get uuid(): string {
        let now = Date.now();
        const ticket = Node._uuid;
        Node._uuid += 1;
        if (Node._uuid > 36 ** 3 - 1) {
            Node._uuid = 36 ** 2;
            while (now === Node._timestamp) {
                now = Date.now();
            }
        }
        this._timestamp = now;
        return ticket.toString(36) + now.toString(36);
    }
    static query(id: string) {
        return Node._instances[id];
    }
    
    private static readonly _products: Record<string, Base.Class> = {};
    protected static useProduct<T extends string>(type: T) {
        return function (Type: new (
            chunk: NodeChunk<T, Base.Data>, 
            parent: Node
        ) => Node<T, Base.Data>) {
            Node._products[type] = Type;
        };
    }

    protected static useValidator<N extends Node>(
        validator: (node: N) => boolean 
    ) {
        return function (
            target: N,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const handler = descriptor.value;
            descriptor.value = function(this: N, ...args) {
                if (validator(this)) {
                    return handler?.apply(this, args);
                } else {
                    console.error('InvalidState:', {
                        target: this,
                        method: key
                    });
                    throw new Error();
                }
            };
            return descriptor;
        };
    }

    protected static useDebugger<N extends Node>(
        validator?: ((node: N) => boolean) | boolean
    ) {
        const logger = console.log;
        return function (
            target: N,
            key: string,
            descriptor: TypedPropertyDescriptor<Base.Func>
        ): TypedPropertyDescriptor<Base.Func> {
            const handler = descriptor.value;
            descriptor.value = function(this: N, ...args) {
                const flag = 
                    typeof validator === 'function' ? 
                        validator(this) : 
                        validator;
                const method = key[0].toUpperCase() + key.slice(1);
                const _logger = console.log;
                console.log = function(...args) {
                    if (flag) logger(method + ":", ...args);
                };
                const result = handler?.apply(this, args);
                console.log = _logger;
                return result;
            };
            return descriptor;
        };
    }
    
    public debug() {
        console.log(this._handlers);
        console.log({ ...this._state });
    }
}
