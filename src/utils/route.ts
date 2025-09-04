import { Model } from "../model";
import { Util } from ".";
import { TranxUtil } from "./tranx";
import { DebugUtil, LogLevel } from "./debug";
import { Route } from "../types/model";
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
            // if isRoot break;
        }
        return route;
    }

    @TranxUtil.span()
    public bind(parent: Model | undefined, key: string) {
        this.emit();
        this._key = key;
        this._parent = parent;
    }

    @TranxUtil.span()
    public unbind() {
        this.emit();
        this._key = undefined;
        this._parent = undefined;
    }

    @TranxUtil.span()
    public emit() {
        const child = this.utils.child;
        const origin: Record<string, Model | Model[]> = child.origin;
        Object.keys(origin).forEach(key => {
            if (origin[key] instanceof Array) origin[key].forEach(item => item.utils.route.emit())
            if (origin[key] instanceof Model) origin[key].utils.route.emit();
        })
    }

    @DebugUtil.log(LogLevel.INFO)
    public reload() {
        this.utils.refer.reload();
        this.utils.event.unload();
        this.utils.state.unload();
        this.utils.event.load();
        this.utils.state.load();
    }

    public check(model: Model): boolean {
        return model.utils.route.current.root === this.current.root;
    }
}
