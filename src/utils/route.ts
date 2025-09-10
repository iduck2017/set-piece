import { Model } from "../model";
import { Util } from ".";
import { TranxUtil } from "./tranx";
import { DebugUtil, LogLevel } from "./debug";
import { Props, Route } from "../types/model";
import { IType } from "../types";

@DebugUtil.is(self => `${self.model.name}::route`)
export class RouteUtil<M extends Model = Model> extends Util<M> {
    private static readonly _root: Array<Function> = [];
    public static root() {
        return function (type: IType<Model>) {
            RouteUtil._root.push(type);
        }
    }
    
    private _key: string | undefined;
    public get key() { return this._key; }
    
    public get isBind() { 
        const type = this.model.constructor;
        return Boolean(this._parent) || RouteUtil._root.includes(type); 
    }

    private _parent: Model | undefined;
    // cache
    public get current(): Route {
        const route: {
            root: Model,
            parent: Model | undefined,
            order: Model[],
        } = { 
            root: this.model,
            parent: this._parent,
            order: [],
        };
        let parent: Model | undefined = this.model;
        while (parent) {
            route.root = parent;
            route.order.push(parent);
            parent = parent.utils.route._parent;
        }
        return route;
    }

    @TranxUtil.span()
    public bind(parent: Model | undefined, key: string) {
        if (this.isBind) return;
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
    public toReload(context: Set<RouteUtil>) {
        if (context.has(this)) return;
        context.add(this);
        const origin: Props.C = this.utils.child.current;
        Object.keys(origin).forEach(key => {
            const value = origin[key]
            if (value instanceof Array) value.forEach(item => item.utils.route.toReload(context))
            if (value instanceof Model) value.utils.route.toReload(context);
        })
    }

    public check(model: Model): boolean {
        return model.utils.route.current.root === this.current.root;
    }
}
