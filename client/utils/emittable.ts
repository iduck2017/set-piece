import type { App } from "../app";
import { BaseFunc } from "../types/base";
import { Util } from "./base";
import type { Receivable } from "./receivable";

export class Emittable<
    E extends BaseFunc,
    T = any
> extends Util<T> {
    public readonly key: string;

    private readonly $list: Array<Receivable<E>> = [];
    public get list() { return [ ...this.$list ]; }

    constructor(
        conf: string[],
        that: T,
        app: App
    ) {
        super(that, app);
        this.key = conf[0] || app.ref.get();
        app.ref.emit.add(this);   
        conf.slice(1).forEach(key => {
            const recv: any = app.ref.recv.map[key];
            if (recv) this.bind(recv);
        });     
    }

    public exec(...data: Parameters<E>) {
        this.$list.forEach(item => {
            item.func(...data);
        });
    }

    private $add(target: Receivable<E>) {
        if (this.$list.includes(target)) {
            throw new Error();
        }
        this.$list.push(target);
    }

    private $del(target: Receivable<E>) {
        const index = this.$list.indexOf(target);
        if (index === -1) {
            throw new Error();
        }
        this.$list.splice(index, 1);
    }

    public bind(that: Receivable<E>) {
        this.$add(that);
        that.$add(this);
    }

    public unbind(that: Receivable<E>) {
        this.$del(that);
        that.$del(this);
    }

    public distroy() { 
        this.$list.forEach(item => {
            return this.unbind(item);
        }); 
    }
    
    public seq() {
        return this.list
            .map(item => item.key)
            .concat(this.key);
    }
}