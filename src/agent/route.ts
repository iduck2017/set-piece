import { DebugService } from "../service/debug";
import { Model } from "../model";
import { Agent } from "./agent";
import { TranxService } from "../service/tranx";

@DebugService.is(agent => agent.target.constructor.name)
export class RouteAgent<
    M extends Model = Model,
    P extends Model = Model,
> extends Agent<M> {
    
    private _isBind: boolean;

    private _isLoad: boolean
    
    public get isLoad(): boolean { return this._isLoad; }

    public get isBind(): boolean { return this._isBind; }


    private _key: string | undefined;

    private _path: string | undefined;

    private _parent: P | undefined;

    private _root: Model | undefined;

    public get key(): string | undefined { return this._key; }

    public get path(): string | undefined { return this._path; }

    public get parent(): P | undefined { return this._parent; }

    public get root(): Model | undefined { return this._root; }


    constructor(target: M) {
        super(target);
        this._isBind = false;
        this._isLoad = false;
    }

    public bind(parent: P | undefined, key: string) {
        this._isBind = true;
        this._key = key;
        this._parent = parent;
    }

    public unbind() {
        this._isBind = false;
        this._key = undefined;
        this._parent = undefined;
    }

    @TranxService.span()
    public reload() {
        this.unload();
        this.load();
    }

    @TranxService.span()
    @DebugService.log()
    public load() {
        this._isLoad = true;
        this._root = this.parent?.agent.route.root ?? this.target;
        this._path = [this.parent?.agent.route.path, this.key].filter(Boolean).join('/');
        this.agent.child.load();
        this.agent.event.load();
        this.agent.state.load();
    }

    @TranxService.span()
    @DebugService.log()
    public unload() {
        this.agent.child.unload();
        this.agent.event.unload();
        this.agent.state.unload();
        this._path = undefined;
        this._root = undefined;
        this._isLoad = false;
    }

    public uninit() {
        this.agent.child.uninit();
        this.agent.refer.uninit();
        this.agent.event.uninit();
        this.agent.state.uninit();
    }


    public static init<T extends Model>(root: T): T {
        root.agent.route.bind(undefined, 'root')
        root.agent.route.load()
        return root;
    }
}
