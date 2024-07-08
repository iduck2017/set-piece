import { BaseIntf } from "../types/model";
import { Emitter } from "./emitter";

export class Handler<
    H extends BaseIntf, T = any
> {
    public container?: T;

    public readonly _list: { 
        [K in keyof H]?: Emitter<Pick<H, K>>[] 
    };

    protected _intf: H;
    public get intf() { return { ...this._intf }; }

    constructor(
        config: {
            list: { [K in keyof H]?: Emitter<Pick<H, K>>[] }
            intf: H
        }
    ) {
        this._list = config.list;
        this._intf = config.intf;
    }

    public _add<K extends keyof H>(
        key: K,
        target: Emitter<Pick<H, K>>
    ) {
        let list = this._list[key];
        if (!list) {
            list = this._list[key] = [];
        }
        list.push(target);
    }

    public _del<K extends keyof H>(
        key: K,
        target: Emitter<Pick<H, K>>
    ) {
        const list = this._list[key];
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
        for (const index in this._list) {
            const key: keyof H = index;
            const list = this._list[key];
            if (list) {
                for (const item of list) {
                    item.unbind(key, this);
                }
            }
        }
    }
}

