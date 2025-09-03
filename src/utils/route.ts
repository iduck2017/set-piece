import { Model } from "../model";
import { Util } from ".";
import { TranxUtil } from "./tranx";
import { DebugUtil, LogLevel } from "./debug";
import { Route } from "../types/model";

@DebugUtil.is(self => `${self.model.name}::route`)
export class RouteUtil<M extends Model = Model> extends Util<M> {
    public static boot<T extends Model>(root: T): T {
        root.utils.route._isRoot = true;
        root.utils.route.bind(undefined, 'root')
        return root;
    }

    private _key: string | undefined;
    public get key() { return this._key; }
    
    private _isRoot: boolean;
    public get isBind() { return Boolean(this._parent) || this._isRoot; }
    public get isRoot() { return this._isRoot; }

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

    constructor(model: M) {
        super(model);
        this._isRoot = false;
    }

    @TranxUtil.span()
    public bind(parent: Model | undefined, key: string) {
        this.reload();
        this._key = key;
        this._parent = parent;
    }

    @TranxUtil.span()
    public unbind() {
        this.reload();
        this._key = undefined;
        this._parent = undefined;
    }

    @TranxUtil.span()
    public reload() {
        const child = this.utils.child;
        const origin: Record<string, Model | Model[]> = child.origin;
        Object.keys(origin).forEach(key => {
            if (origin[key] instanceof Array) origin[key].forEach(item => item.utils.route.reload())
            if (origin[key] instanceof Model) origin[key].utils.route.reload();
        })
    }

    @DebugUtil.log(LogLevel.INFO)
    public load() {
        this.utils.event.load();
        this.utils.state.load();
    }

    @DebugUtil.log(LogLevel.INFO)
    public unload() {
        this.utils.event.unload();
        this.utils.state.unload();
        this.utils.refer.unload();
    }

    public check(model: Model): boolean {
        return model.utils.route.current.root === this.current.root;
    }
}
