import { BaseData, Union } from "../types/base";
import { CalcIntf } from "../types/common";
import { Util } from "./base";

export class Calculable<
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    T = any,
> extends Util<T> {
    public readonly stat: S;

    private readonly $rule: R;
    private readonly $info: I;
    private readonly $stat: S;
    private readonly $cur : Union<S, Union<I, R>>;
    
    public get cur() { return { ...this.$cur }; }
    public get rule() { return { ...this.$rule }; }
    public get info() { return { ...this.$info }; }

    private readonly $event: CalcIntf;

    constructor(config: {
        target: T,
        rule  : R,
        info  : I
        stat  : S,
        event : CalcIntf,
    }) {
        super(config);
        this.$rule = config.rule;
        this.$info = config.info;
        this.$stat = config.stat;
        this.$event = config.event;
        this.$cur = { 
            ...config.rule,
            ...config.info,
            ...config.stat  
        }; 

        this.stat = new Proxy(this.$stat, {
            set: (target, key: keyof S, value) => {
                target[key] = value;
                this.update(key);
                return true;
            }
        });

        for (const key in this.$info) this.update(key);
        for (const key in this.$stat) this.update(key);
    }

    public update<K extends keyof (I & S)>(key: K) {
        const prev = this.$cur[key];
        const next = {
            ...this.$rule,
            ...this.$info,
            ...this.$stat
        }[key];

        const data = {
            target: this,
            key,
            prev  : next,
            next  : next
        };

        this.$event.dataCheckBefore(data);
        this.$cur[key] = data.next;
        if (prev !== data.next) {
            this.$event.dataUpdateDone(data);
        }
    }
}
