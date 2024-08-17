import type { App } from "../app";
import { BaseData, Union } from "../types/base";
import { ConnSeqMap, HookMap } from "../types/map";
import { Util } from "./base";
import { Emittable } from "./emittable";

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
    private readonly $cur: Union<S, Union<I, R>>;
    private readonly $hook: HookMap<Union<S, I>>;
    private readonly $pipe: HookMap<Union<S, I>>;
    
    public get cur() { return { ...this.$cur }; }
    public get rule() { return { ...this.$rule }; }
    public get info() { return { ...this.$info }; }
    public get hook() { return { ...this.$hook }; }
    public get pipe() { return { ...this.$pipe }; }

    constructor(
        conf: {
            rule: R,
            info: I
            stat: S,
            hook?: ConnSeqMap<Union<S, I>>,
            pipe?: ConnSeqMap<Union<S, I>>
        }, 
        target: T, 
        app: App
    ) {
        super(target, app);
        this.$rule = conf.rule;
        this.$info = conf.info;
        this.$stat = conf.stat;
        this.$cur = { 
            ...conf.rule,
            ...conf.info,
            ...conf.stat  
        }; 
        
        this.$hook = new Proxy(
            Object.keys(conf.hook || {})
                .reduce((prev, key) => ({
                    ...prev,
                    [key]: new Emittable(
                        conf.hook?.[key] || [],
                        this,
                        app
                    )
                }), {} as HookMap<Union<S, I>>),
            {
                get: (target, key: keyof Union<S, I>) => {
                    if (!target[key]) { 
                        target[key] = new Emittable([], this, app); 
                    }
                    return target[key];
                },
                set: () => false
            }
        ); 

        this.$pipe = new Proxy(
            Object.keys(conf.hook || {})
                .reduce((prev, key) => ({
                    ...prev,
                    [key]: new Emittable(
                        conf.hook?.[key] || [],
                        this,
                        app
                    )
                }), {} as HookMap<Union<S, I>>),
            {
                get: (target, key: keyof Union<S, I>) => {
                    if (!target[key]) { 
                        target[key] = new Emittable([], this, app); 
                    }
                    return target[key];
                },
                set: () => false
            }
        ); 

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
            prev: next,
            next: next
        };

        // this.$event.dataCheckBefore(data);
        // this.$cur[key] = data.next;
        // if (prev !== data.next) {
        //     this.$event.dataUpdateDone(data);
        // }
    }
}
