import { BaseIntf } from "../types/base";
import { RecvRef } from "../types/reference";
import { Util } from "./base";
import { Callable } from "./callable";

export class Receivable<
    H extends BaseIntf, 
    T = any
> extends Util<T> {
    private readonly $ref  : RecvRef<H>;
    private readonly $event: H;

    public get event() { return { ...this.$event }; }
    public get refer() {
        const result = { ...this.$ref };
        for (const key in this.$ref) {
            const list = this.$ref[key];
            result[key] = list ? [ ...list ] : [];
        }
        return result;
    }

    constructor(config: {
        target: T,
        ref   : RecvRef<H>
        event : H
    }) {
        super(config);
        this.$ref = config.ref;
        this.$event = config.event;
    }

    public $add<K extends keyof H>(
        key: K,
        target: Callable<Pick<H, K>>
    ) {
        const emitters = this.$ref[key];
        if (!emitters) this.$ref[key] = [ target ];
        else emitters.push(target);
    }

    public $del<K extends keyof H>(
        key: K,
        target: Callable<Pick<H, K>>
    ) {
        const list = this.$ref[key];
        if (!list) throw new Error();
        const index = list.indexOf(target);
        if (index === -1) throw new Error();
        list.splice(index, 1);
    }

    public dispose() {
        for (const index in this.$ref) {
            const key: keyof H = index;
            const list = this.$ref[key] || [];
            for (const item of list) {
                item.unbind(key, this);
            }
        }
    }
}

