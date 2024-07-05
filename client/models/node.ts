import { BaseData, BaseEvent } from "../types/base";
import { EventId } from "../types/events";
import { ModelEvent } from "../types/model";

class Base<T = any> {
    private _container!: T;
    public get container() { return this._container; }

    public _mount(
        container: T
    ) {
        this._container = container;
    }
}

class Provider<
    E extends BaseEvent, T = any
> extends Base<T> {
    public readonly _consumers: { 
        [K in keyof E]?: Consumer<Pick<E, K>>[] 
    };
    
    public _emitters: E;
    
    constructor() {
        super();
        this._consumers = {};
        this._emitters = new Proxy({} as E, {
            get: (target, key) => {
                return this._emit.bind(this, key as keyof E);
            }
        });
    }

    private _emit<K extends keyof E>(
        key: K,
        ...data: Parameters<E[K]>
    ) {
        const consumers = this._consumers[key];
        if (consumers) {
            for (const consumer of consumers) {
                if (consumer.handlers) {
                    consumer.handlers[key](...data);
                }
            }
        }
    }

    public bind<K extends keyof E>(
        key: K,
        that: Consumer<Pick<E, K>>
    ) {
        let providers = that._providers[key];
        let consumers = this._consumers[key];
        if (!providers) {
            providers = that._providers[key] = [];
        }
        if (!consumers) {
            consumers = this._consumers[key] = [];
        }
        providers.push(this);
        consumers.push(that);
    }

    public unbind<K extends keyof E>(
        key: K,
        that: Consumer<Pick<E, K>>
    ) {
        const providers = that._providers[key];
        const consumers = this._consumers[key];
        if (!providers || !consumers) {
            throw new Error();
        }
        const providerId = providers.indexOf(this);
        const consumerId = consumers.indexOf(that);

        if (providerId === -1 || consumerId === -1) {
            throw new Error();
        }
        providers.splice(providers.indexOf(this), 1);
        consumers.splice(consumers.indexOf(that), 1);
    }
}

class Consumer<
    H extends BaseEvent, T = any
> extends Base<T> {
    public readonly _providers: { 
        [K in keyof H]?: Provider<Pick<H, K>>[] 
    };

    protected _handlers: H;
    public get handlers() { return { ...this._handlers }; }

    constructor(
        handlers: H
    ) {
        super();
        this._providers = {};
        this._handlers = handlers;
    }

    public _dispose() {
        for (const index in this._providers) {
            const key: keyof H = index;
            const providers = this._providers[key];
            if (providers) {
                for (const provider of providers) {
                    provider.unbind(key, this);
                }
            }
        }
    }

    public _save() {
        return {
            providers: this._providers
        };
    }
}

class Data<
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    T = any,
> extends Base<T> {
    public readonly _rule: R;
    public readonly _info: I;
    public readonly _stat: S;

    private readonly _calc: R & I & S;
    public get calc() { return { ...this._calc }; }

    private readonly _handlers: ModelEvent<{}>;

    constructor(
        config: {
            rule: R,
            info: I,
            stat: S,
        }, 
        handlers: ModelEvent<{}> 
    ) {
        super();
        this._handlers = handlers;

        this._rule = config.rule;
        this._info = config.info;

        Object.freeze(this._rule);
        Object.freeze(this._info);

        this._stat = new Proxy(config.stat, {
            set: this._set.bind(this)
        });

        this._calc = { ...config.rule } as R & I & S;
    }

    public _set<K extends keyof S>(
        target: S, 
        key: string, 
        value: S[K]
    ) {
        target[key as K] = value;
        this.update(key);
        return true;
    }

    public update<K extends keyof (I & S)>(key: K) {
        const prev = this._calc[key];
        const next = {
            ...this._rule,
            ...this._info,
            ...this._stat
        }[key];

        const data = {
            target: this,
            key,
            prev: next,
            next: next
        };
        
        this._handlers[EventId.CHECK_BEFORE](data);
        this._calc[key] = data.next;
        if (prev !== data.next) {
            this._handlers[EventId.UPDATE_DONE]({
                target: this,
                key,
                prev,
                next: data.next
            });
        }
    }

    public _mount(container: T) {
        super._mount(container);
        for (const key in this._info) {
            this.update(key);
        }
        for (const key in this._stat) {
            this.update(key);
        }
    }

}

class Node<
    P extends T,
    C extends T,
    D extends Record<string, C>,
    T = any,
> extends Base<T> {
    private _parent?: P;
    public get parent() { return this._parent; }

    private readonly _children: C[];
    public get children(): C[] { return [...this._children]; }

    private readonly _dict: Record<keyof D, number>;

    constructor(
        config: {
            children: C[],
            dict: Record<keyof D, number>
        }
    ) {
        super();
        this._children = config.children;
        this._dict = config.dict;
    }

    public get<K extends keyof D>(key: K): D[K] {
        const index = this._dict[key];
        return this._children[index] as D[K];
    }

    public _set<K extends keyof D>(key: K, value: D[K]) {
        const index = this._dict[key];
        if (index === undefined) {
            const length = this._children.length;
            this._children.push(value);
            this._dict[key] = length;
        } else {
            this._children[index] = value;
        }
    }

    public _add(value: C) {
        this._children.push(value);
    }

    public _del(value: C) {
        const index = this._children.indexOf(value);
        if (index === -1) throw new Error();
        this._children.splice(index, 1);
    }

    public _mount(
        container: T,
        parent?: P
    ) {
        super._mount(container);
        this._parent = parent;
    } 
}

export {
    Provider,
    Consumer,
    Data,
    Node
};