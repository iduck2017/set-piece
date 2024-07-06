import { Base } from "./base";

export class Node<
    P extends T,
    C extends T,
    D extends Record<string, C>,
    T = any,
> extends Base<T> {
    private _parent?: P;
    public get parent(): P { 
        const parent = this._parent; 
        if (!parent) {
            throw new Error();
        }
        return parent;
    }

    private readonly _children: C[];
    public get children(): C[] { return [...this._children]; }

    public readonly _dict: Record<keyof D, number>;

    constructor(
        config: {
            children: C[],
            dict: Record<keyof D, number>
        }
    ) {
        super();
        this._children = config.children;
        this._dict = config.dict;
    }

    public get<K extends keyof D>(key: K): D[K] {
        const index = this._dict[key];
        return this._children[index] as D[K];
    }

    public _set<K extends keyof D>(key: K, value: D[K]) {
        const index = this._dict[key];
        if (index === undefined) {
            const length = this._children.length;
            this._children.push(value);
            this._dict[key] = length;
        } else {
            this._children[index] = value;
        }
    }

    public _add(value: C) {
        this._children.push(value);
    }

    public _del(value: C) {
        const index = this._children.indexOf(value);
        if (index === -1) {
            throw new Error();
        }
        this._children.splice(index, 1);
    }

    public _mount(options: {
        container: T,
        parent: P
    }) {
        super._mount(options);
        this._parent = options.parent;
    } 
}