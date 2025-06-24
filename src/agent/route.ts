import { Model } from "../model";
import { Agent } from "./agent";
import { TranxService } from "../service/tranx";
import { DebugService, LogLevel } from "../service/debug";

@DebugService.is(self => `${self.model.name}::route`)
export class RouteAgent<
    M extends Model = Model,
    P extends Model = Model,
> extends Agent<M> {
    
    public static boot<T extends Model>(root: T): T {
        console.log('boot', root.name)
        root.agent.route._isRoot = true;
        root.agent.route.bind(undefined, 'root')
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

    private _parent: P | undefined;
    public get parent() { return this._parent; }
    public get root(): Model { return this.parent?.agent.route.root ?? this.model; }

    constructor(model: M) {
        super(model);
        this._isBind = false;
        this._isLoad = false;
        this._isRoot = false;
    }

    @TranxService.use()
    public bind(parent: P | undefined, key: string) {
        this._isBind = true;
        this._key = key;
        this._parent = parent;
    }

    @TranxService.use()
    public unbind() {
        this._isBind = false;
        this._key = undefined;
        this._parent = undefined;
    }

    @TranxService.use()
    public reload() {}

    @DebugService.log(LogLevel.DEBUG)
    public load() {
        this.agent.child.load();
        this.agent.event.load();
        this.agent.state.load();
        this._isLoad = true;
    }

    @DebugService.log(LogLevel.DEBUG)
    public unload() {
        this._isLoad = false;
        this.agent.child.unload();
        this.agent.event.unload();
        this.agent.state.unload();
        this.agent.refer.reset();
    }
}
