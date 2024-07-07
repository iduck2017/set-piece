import { BaseRecord } from "../types/base";

export class Node<
    P extends T,
    L extends T[],
    D extends Record<string, T>,
    T = any,
> {
    protected _parent?: P;
    public get parent(): P { 
        const parent = this._parent; 
        if (!parent) {
            throw new Error();
        }
        return parent;
    }

    private readonly _list: L;
    public get list() { return [...this._list]; }

    public readonly dict: D;

    public get children(): T[] { 
        const children: T[] = [];
        for (const item of this._list) {
            children.push(item);
        }
        for (const key in this.dict) {
            children.push(this.dict[key]);
        }
        return children;
    }

    constructor(config: {
        list: L,
        dict: D
    }) {
        this._list = config.list;
        this.dict = new Proxy(config.dict, {
            set: (
                target: BaseRecord, 
                key: string, 
                value
            ) => {
                this._set(key, value);
                return true;
            }
        });
    }

    protected _set<K extends keyof D>(key: K, value: D[K]) {
        if (this.dict[key]) {
            throw new Error();
        }
        this.dict[key] = value;
    }

    public _add(value: L[number]) {
        this._list.push(value);
    }

    public _del(value: L[number]) {
        const index = this._list.indexOf(value);
        if (index === -1) {
            throw new Error();
        }
        this._list.splice(index, 1);
    }
}