import { Model } from "../model";
import { Util } from ".";
import { TranxUtil } from "./tranx";
import { IClass } from "../types";

export type Route = {
    parent?: Model;
    root: Model;
    items: Model[];
}

export class RouteUtil<M extends Model> extends Util<M> {
    
    // static
    private static readonly _root: Set<Function> = new Set();
    public static root() {
        return function (type: new (...args: any[]) => Model) {
            RouteUtil._root.add(type);
        }
    }

    // instance
    private _key: string | undefined;
    public get key() { return this._key; }
    
    private _parent: Model | undefined;

    public get origin() {
        const result: Route = {
            parent: this._parent,
            root: this.model,
            items: []
        }
        let parent: Model | undefined = this.model;
        while (parent) {
            result.root = parent;
            result.items.push(parent);
            parent = parent.utils?.route._parent;
        }
        return result;
    }

    private _current: Route;
    public get current(): Route {
        return { ...this._current }
    }

    constructor(model: M) {
        super(model);
        this._current = this.origin
    }

    public update() {
        this._current = this.origin;
    }

    @TranxUtil.span()
    public bind(parent: Model | undefined, key: string) {
        if (this._parent) return;
        if (RouteUtil._root.has(this.model.constructor)) return;
        this.preload(new Set());
        this._key = key;
        this._parent = parent;
    }

    @TranxUtil.span()
    public unbind() {
        this.preload(new Set());
        this._key = undefined;
        this._parent = undefined;
    }

    @TranxUtil.span()
    public preload(context: Set<RouteUtil<Model>>) {
        if (context.has(this)) return;
        context.add(this);
        const origin: Model.C = this.utils.child.current;
        Object.keys(origin).forEach(key => {
            const value = origin[key]
            if (value instanceof Model) value.utils.route.preload(context);
            if (value instanceof Array) {
                value.forEach(item => item.utils.route.preload(context))
            }
        })
    }

    public compare(model: Model): boolean {
        return model.utils.route.current.root === this.current.root;
    }

    public locate(parent: Model): [string, IClass][] {
        const result: [string, IClass][] = [];
        let current: Model | undefined = this.model;
        while (current) {
            if (current === parent) break;
            result.unshift([
                current.utils.route._key, 
                current.constructor
            ] as any);  
            current = current.utils.route._parent;  
        }
        // not ancestor
        if (!current) return []
        return result;
    }

    public validate(
        steps: [string, IClass][], 
        keys: Array<string | IClass>, 
        name?: string
    ): boolean {
        keys = [...keys];
        steps = [...steps];
        if (!keys.length && !steps.length) return true;

        const key = keys.shift();
        if (!key) return false;

        if (typeof key === 'string') {
            const step = steps.shift();
            if (!step) return false
            if (step[0] !== key) return false;
            return this.validate(steps, keys, name);
        } else {
            let isValid: boolean = false;
            steps.forEach((step, index) => {
                if (isValid === true) return;
                if (!(step[1].prototype instanceof key) && key !== step[1]) return;
                if (!this.validate(steps.slice(index + 1), keys, name)) return;
                isValid = true;
            })
            return isValid;
        }
    }
}