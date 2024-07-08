import { BaseIntf } from "../types/model";
import { Emitter } from "./emitter";

export class Handler<
    H extends BaseIntf, T = any
> {
    public container?: T;

    public readonly _map: { 
        [K in keyof H]?: Emitter<Pick<H, K>>[] 
    };

    protected _intf: H;
    public get intf() { return { ...this._intf }; }

    constructor(
        config: {
            map: { [K in keyof H]?: Emitter<Pick<H, K>>[] }
            intf: H
        }
    ) {
        this._map = config.map;
        this._intf = config.intf;
    }

    public _add<K extends keyof H>(
        key: K,
        target: Emitter<Pick<H, K>>
    ) {
        let emitters = this._map[key];
        if (!emitters) {
            emitters = this._map[key] = [];
        }
        emitters.push(target);
    }

    public _del<K extends keyof H>(
        key: K,
        target: Emitter<Pick<H, K>>
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

    public _dispose() {
        for (const index in this._map) {
            const key: keyof H = index;
            const list = this._map[key];
            if (list) {
                for (const item of list) {
                    item.unbind(key, this);
                }
            }
        }
    }
}

