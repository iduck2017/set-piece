import { BaseIntf } from "../types/model";
import type { Handler } from "./handler";

export class Emitter<
    E extends BaseIntf, T = any
> {
    public container?: T;

    public readonly _map: { 
        [K in keyof E]?: Array<Handler<Pick<E, K>>> 
    };
    
    public _intf: E;
    
    constructor(config: {
        target: { [K in keyof E]?: Array<Handler<Pick<E, K>>> }
    }) {
        this._map = config.target;
        this._intf = new Proxy({} as E, {
            get: (target, key) => {
                return this._emit.bind(this, key as keyof E);
            }
        });
    }

    private _emit<K extends keyof E>(
        key: K,
        ...data: Parameters<E[K]>
    ) {
        const list = this._map[key];
        if (list) {
            for (const item of list) {
                if (item.intf) {
                    item.intf[key](...data);
                }
            }
        }
    }
    
    public _add<K extends keyof E>(
        key: K,
        target: Handler<Pick<E, K>>
    ) {
        let list = this._map[key];
        if (!list) {
            list = this._map[key] = [];
        }
        list.push(target);
    }

    public _del<K extends keyof E>(
        key: K,
        target: Handler<Pick<E, K>>
    ) {
        const list = this._map[key];
        if (!list) {
            throw new Error();
        }
        const index = list.indexOf(target);

        if (index === -1) {
            throw new Error();
        }
        list.splice(index, 1);
    }

    public bind<K extends keyof E>(
        key: K,
        that: Handler<Pick<E, K>>
    ) {
        this._add(key, that);
        that._add(key, this);
    }

    public unbind<K extends keyof E>(
        key: K,
        that: Handler<Pick<E, K>>
    ) {
        this._del(key, that);
        that._del(key, this);
    }
}