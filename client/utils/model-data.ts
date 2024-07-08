import { BaseData } from "../types/base";
import { EventId } from "../types/events";
import { BaseModel } from "../types/model";

export class Data<
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
> {
    private _container?: BaseModel;
    public get container(): BaseModel {
        const result = this._container;
        if (!result) {
            throw new Error();
        }
        return result;
    }

    public readonly _rule: R;
    public readonly _info: I;
    public readonly _stat: S;

    protected readonly _calc: R & I & S;
    public get calc() { return { ...this._calc }; }

    constructor(
        config: {
            rule: R,
            info: I
            stat: S 
        } 
    ) {
        this._rule = new Proxy(config.rule, { set: () => false });
        this._info = new Proxy(config.info, { set: () => false });
        this._stat = new Proxy(
            config.stat, 
            { set: this._set.bind(this) }
        );

        this._calc = { 
            ...config.rule,
            ...config.info,
            ...config.stat  
        }; 
    }

    protected _set<K extends keyof S>(
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
        
        this.container.emit[EventId.CHECK_BEFORE](data);
        this._calc[key] = data.next;
        if (prev !== data.next) {
            this.container.emit[EventId.UPDATE_DONE](data);
        }
    }

    public _mount(options: {
        container: BaseModel
    }) {
        this._container = options.container;

        for (const key in this._info) {
            this.update(key);
        }
        for (const key in this._stat) {
            this.update(key);
        }
    }

    public _serialize() {
        return {
            stat: this._stat,
            rule: this._rule
        };
    }
}
