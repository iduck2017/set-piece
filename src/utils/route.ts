import { Model } from "../model";
import { Util } from ".";
import { TranxUtil } from "./tranx";
import { DebugUtil, LogLevel } from "./debug";
import { Format, Props } from "../types/model";
import { IType } from "../types";

@DebugUtil.is(self => `${self.model.name}::route`)
export class RouteUtil<
    M extends Model = Model,
    P extends Props.P = Props.P
> extends Util<M> {
    private static readonly _root: Set<Function> = new Set();
    public static root() {
        return function (type: IType<Model>) {
            RouteUtil._root.add(type);
        }
    }
    
    private _key: string | undefined;
    public get key() { return this._key; }
    
    public get isBind() { 
        const type = this.model.constructor;
        return Boolean(this._parent) || RouteUtil._root.has(type); 
    }

    private readonly props: Record<string, any>;

    public _parent: Model | undefined;
    private _current: Format.P<P>;
    public get current(): Readonly<Format.P<P>> { return { ...this._current } }

    constructor(model: M, props: P) {
        super(model);
        this.props = {};
        Object.keys(props).forEach(key => {
            const value = props[key];
            if (!value) return;
            const type = value.constructor;
            this.props[key] = type;
        })
        this._current = this.copy()
    }

    public update() {
        const current = this.copy();
        this._current = current
    }

    public copy(): Format.P<P> {
        const result: any = {};
        let parent: Model | undefined = this.model;
        while (parent) {
            result.root = parent;
            Object.keys(this.props).forEach(key => {
                if (result[key]) return;
                const type: IType<Model> = this.props[key];
                if (parent instanceof type) result[key] = parent;
            })
            parent = parent.utils?.route._parent;
        }
        result.parent = this._parent;
        return result;
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
