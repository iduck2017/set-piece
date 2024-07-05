import { BaseEvent } from "../types/base";
import { Base } from "./base";
import type { Consumer } from "./consumer";

export class Provider<
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
    
    public _add<K extends keyof E>(
        key: K,
        target: Consumer<Pick<E, K>>
    ) {
        let consumers = this._consumers[key];
        if (!consumers) {
            consumers = this._consumers[key] = [];
        }
        consumers.push(target);
    }

    public _del<K extends keyof E>(
        key: K,
        target: Consumer<Pick<E, K>>
    ) {
        const consumers = this._consumers[key];
        if (!consumers) {
            throw new Error();
        }
        const consumerId = consumers.indexOf(target);

        if (consumerId === -1) {
            throw new Error();
        }
        consumers.splice(consumerId, 1);
    }

    public bind<K extends keyof E>(
        key: K,
        that: Consumer<Pick<E, K>>
    ) {
        this._add(key, that);
        that._add(key, this);
    }

    public unbind<K extends keyof E>(
        key: K,
        that: Consumer<Pick<E, K>>
    ) {
        this._del(key, that);
        that._del(key, this);
    }
}