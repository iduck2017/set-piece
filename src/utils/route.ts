import { Model } from "../model";
import { Util } from ".";
import { TranxUtil } from "./tranx";
import { DebugUtil, LogLevel } from "./debug";

@DebugUtil.is(self => `${self.model.name}::route`)
export class RouteUtil<M extends Model = Model> extends Util<M> {
    public static boot<T extends Model>(root: T): T {
        root.utils.route._isRoot = true;
        root.utils.route.bind(undefined, 'root')
        return root;
    }

    private _key: string | undefined;
    public get key() { return this._key; }
    
    private _isBind: boolean;
    private _isLoad: boolean;
    private _isRoot: boolean;
    public get isBind() { return this._isBind; }
    public get isLoad() { return this._isLoad; }
    public get isRoot() { return this._isRoot; }

    private _parent: Model | undefined;
    public get current(): Model.Route {
        const route: Model.Route = { 
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

    constructor(model: M) {
        super(model);
        this._isBind = false;
        this._isLoad = false;
        this._isRoot = false;
    }

    @TranxUtil.span()
    public bind(parent: Model | undefined, key: string) {
        this.utils.child.reload();
        this._isBind = true;
        this._key = key;
        this._parent = parent;
    }

    @TranxUtil.span()
    public unbind() {
        this.utils.child.reload();
        this._isBind = false;
        this._key = undefined;
        this._parent = undefined;
    }

    @TranxUtil.span()
    public reload() {
        this.utils.child.reload();
    }

    @DebugUtil.log(LogLevel.INFO)
    public load() {
        this.utils.event.load();
        this.utils.state.load();
        this._isLoad = true;
    }

    @DebugUtil.log(LogLevel.INFO)
    public unload() {
        this._isLoad = false;
        this.utils.event.unload();
        this.utils.state.unload();
        this.utils.refer.unload();
    }

    public check(model: Model): boolean {
        return model.utils.route.current.root === this.current.root;
    }
}
