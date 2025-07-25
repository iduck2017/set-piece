import { Model, Route } from "../model";
import { Util } from ".";
import { TranxUtil } from "./tranx";
import { DebugUtil, LogLevel } from "./debug";

@DebugUtil.is(self => `${self.model.name}::route`)
export class RouteUtil<M extends Model = Model> extends Util<M> {
    public static boot<T extends Model>(root: T): T {
        console.log('boot', root.name)
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

    private _origin: Model;
    private _parent: Model | undefined;
    public get origin() { return this._origin; }
    public get parent() { return this._parent; }

    constructor(model: M) {
        super(model);
        this._isBind = false;
        this._isLoad = false;
        this._isRoot = false;
        this._origin = model;
    }

    @TranxUtil.span()
    public bind(parent: Model | undefined, key: string) {
        this._isBind = true;
        this._key = key;
        this._parent = parent;
        this._origin = parent?.utils.route._origin ?? this.model;
        this.utils.child.reload();
    }

    @TranxUtil.span()
    public unbind() {
        this._isBind = false;
        this._key = undefined;
        this._parent = undefined;
        this._origin = this.model;
        this.utils.child.reload();
    }

    @TranxUtil.span()
    public reload() {}

    @DebugUtil.log(LogLevel.DEBUG)
    public load() {
        this.utils.event.load();
        this.utils.state.load();
        this._isLoad = true;
    }

    @DebugUtil.log(LogLevel.DEBUG)
    public unload() {
        this._isLoad = false;
        this.utils.event.unload();
        this.utils.state.unload();
        this.utils.refer.reset();
    }

}
