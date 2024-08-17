import type { App } from "../app";
import { BaseArray, BaseRecord } from "../types/base";
import { Util } from "./base";

export class Inheritable<
    L extends BaseArray,
    D extends BaseRecord,
    P = any,
    T = any,
> extends Util<T> {
    private readonly $parent: P;
    private readonly $dict  : D;
    private readonly $list  : L;

    public get dict() { return { ...this.$dict }; }
    public get list() { return [ ...this.$list ]; }
    public get parent() { return this.$parent; }
    public get children(): any[] { 
        const children: any[] = [];
        for (const item of this.$list) children.push(item);
        for (const item of Object.values(this.$dict)) children.push(item);
        return children;
    }

    constructor(
        config: {
            parent: P,
            list  : L,
            dict  : D,
        }, 
        target: T,
        app: App
    ) {
        super(target, app);
        this.$parent = config.parent;
        this.$list = config.list;
        this.$dict = config.dict;
    }

    public set<K extends keyof D>(key: K, value: D[K]) {
        if (this.$dict[key]) throw new Error();
        this.$dict[key] = value;
        // this.$event.childUpdateDone({
        //     target: this,
        //     child : value
        // });
    }

    public add(value: L[number]) {
        this.$list.push(value);
        // this.$event.childUpdateDone({
        //     target: this,
        //     child : value
        // });
    }

    public del<K extends keyof D>(value: L[number] | D[K]) {
        for (const key in this.$dict) {
            if (this.$dict[key] === value) {
                delete this.$dict[key];
            }
        }
        const index = this.$list.indexOf(value);
        if (index < 0) throw new Error();
        this.$list.splice(index, 1);
        // this.$event.childUpdateDone({
        //     target: this,
        //     child : value
        // });
    }
}