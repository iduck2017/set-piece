import { BaseData } from "../types/base";
import { EventId } from "../types/events";
import type { ModelEvent } from "../types/model";
import { Base } from "./base";

export class Data<
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

    private _set<K extends keyof S>(
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
