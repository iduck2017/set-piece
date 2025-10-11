import { Model } from "../model";
import { Util } from ".";
import { TranxUtil } from "./tranx";

export type Route = {
    parent?: Model;
    root: Model;
    list: Model[];
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
            list: []
        }
        let parent: Model | undefined = this.model;
        while (parent) {
            result.root = parent;
            result.list.push(parent);
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
        this.toReload(new Set());
        this._key = key;
        this._parent = parent;
    }

    @TranxUtil.span()
    public unbind() {
        this.toReload(new Set());
        this._key = undefined;
        this._parent = undefined;
    }

    @TranxUtil.span()
    public toReload(context: Set<RouteUtil<Model>>) {
        if (context.has(this)) return;
        context.add(this);
        const origin: Model.C = this.utils.child.current;
        Object.keys(origin).forEach(key => {
            const value = origin[key]
            if (value instanceof Model) value.utils.route.toReload(context);
            if (value instanceof Array) {
                value.forEach(item => item.utils.route.toReload(context))
            }
        })
    }

    public compare(model: Model): boolean {
        return model.utils.route.current.root === this.current.root;
    }
}