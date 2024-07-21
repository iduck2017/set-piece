import { BaseIntf } from "../types/base";
import type { CallRef } from "../types/reference";
import { Util } from "./base";
import type { Receivable } from "./receivable";

export class Callable<
    E extends BaseIntf, 
    T = any
> extends Util<T> {
    public readonly event: E;

    private readonly $ref: CallRef<E>;
    public get ref() {
        const result = { ...this.$ref };
        for (const key in this.$ref) {
            const list = this.$ref[key];
            result[key] = list ? [ ...list ] : [];
        }
        return result;
    }

    constructor(config: {
        target: T
        ref   : CallRef<E>
    }) {
        super(config);
        this.$ref = config.ref;
        this.event = new Proxy({} as E, {
            get: (target, key: keyof E) => {
                return ((...data: any) => {
                    const recvers = this.$ref[key] || [];
                    for (const item of recvers) {
                        item.event[key](...data);
                    }
                });
            }
        });
    }

    private $add<K extends keyof E>(
        key: K,
        target: Receivable<Pick<E, K>>
    ) {
        const list = this.$ref[key];
        if (list) list.push(target);
        else this.$ref[key] = [ target ];
    }

    private $del<K extends keyof E>(
        key: K,
        target: Receivable<Pick<E, K>>
    ) {
        const recvers = this.$ref[key];
        if (!recvers) throw new Error();
        const index = recvers.indexOf(target);
        if (index === -1) throw new Error();
        recvers.splice(index, 1);
    }

    public bind<K extends keyof E>(
        key: K,
        that: Receivable<Pick<E, K>>
    ) {
        this.$add(key, that);
        that.$add(key, this);
    }

    public unbind<K extends keyof E>(
        key: K,
        that: Receivable<Pick<E, K>>
    ) {
        this.$del(key, that);
        that.$del(key, this);
    }
}