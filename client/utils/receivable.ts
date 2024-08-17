import type { App } from "../app";
import { BaseFunc } from "../types/base";
import { Util } from "./base";
import { Emittable } from "./emittable";

export class Receivable<
    E extends BaseFunc,
    T = any
> extends Util<T> {
    public readonly key: string;
    
    private readonly $list: Array<Emittable<E>> = [];
    public get list() { return [ ...this.$list ]; }

    public readonly func: E;

    constructor(
        func: E, 
        conf: string[], 
        target: T, 
        app: App
    ) {
        super(target, app);
        this.func = func;
        this.key = conf[0] || app.ref.get();
        app.ref.recv.add(this);
        conf.slice(1).forEach(key => {
            const emit = app.ref.emit.map[key];
            if (emit) emit.bind(this);
        });   
    }

    public $add(target: Emittable<E>) {
        if (this.$list.includes(target)) {
            throw new Error();
        }
        this.$list.push(target);
    }

    public $del(target: Emittable<E>) {
        const index = this.$list.indexOf(target);
        if (index === -1) {
            throw new Error();
        }
        this.$list.splice(index, 1);
    }

    public distroy() {
        this.$list.forEach(item => {
            item.unbind(this);
        });
    }

    public seq() {
        return [ 
            this.key,
            ...this.list.map(item => item.key)
        ];
    }
}