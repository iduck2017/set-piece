import { Model } from "../model";
import { Util } from ".";
import { TranxUtil } from "./tranx";
import { DebugUtil, LogLevel } from "./debug";
import { Constructor } from "../types";

export type Route<P extends Model.Route = Model.Route> = Partial<P & {
    parent: Model;
    root: Model;
}>

@DebugUtil.is(self => `${self.model.name}::route`)
export class RouteUtil<
    M extends Model = Model,
    P extends Model.Route = Model.Route,
> extends Util<M> {
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


    private _root: Model;
    private _parent: Model | undefined;
    private _config: { [K in keyof P]?: [number, Constructor<P[K]>] };
    public get current(): Route<P> {
        const result: any = {
            parent: this._parent,
            root: this._root,
        };
        Object.keys(this._config).forEach((key: keyof P) => {
            const item = this._config[key];
            if (!item) return;
            const type = item[1];
            let depth = item[0];
            let parent: Model | undefined = this.model;
            while (depth > 0 && parent) {
                depth -= 1;
                parent = parent.utils.route._parent;
            }
            if (parent instanceof type) result[key] = parent;
        });
        return result;
    }

    constructor(model: M, route: { [K in keyof P]?: [number, Constructor<P[K]>] }) {
        super(model);
        this._isBind = false;
        this._isLoad = false;
        this._isRoot = false;
        this._config = route;
        this._root = model;
    }

    @TranxUtil.span()
    public bind(parent: Model | undefined, key: string) {
        this._isBind = true;
        this._key = key;
        this._parent = parent;
        this._root = parent?.utils.route._root ?? this.model;
    }

    @TranxUtil.span()
    public unbind() {
        this._isBind = false;
        this._key = undefined;
        this._parent = undefined;
        this._root = this.model;
    }

    @TranxUtil.span()
    public reload() {}

    @DebugUtil.log(LogLevel.DEBUG)
    public load() {
        this.utils.child.load();
        this.utils.event.load();
        this.utils.state.load();
        this._isLoad = true;
    }

    @DebugUtil.log(LogLevel.DEBUG)
    public unload() {
        this._isLoad = false;
        this.utils.child.unload();
        this.utils.event.unload();
        this.utils.state.unload();
        this.utils.refer.reset();
    }

}
