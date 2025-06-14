import { Model } from "../model";
import { Agent } from "./agent";
import { TranxService } from "../service/tranx";
import { DebugService } from "../service/debug";

export class RouteAgent<
    M extends Model = Model,
    P extends Model = Model,
> extends Agent<M> {

    private _key: string | undefined;
    
    private _isBind: boolean;

    private _isLoad: boolean;

    private _isRoot: boolean;
    
    private _parent: P | undefined;



    public get key() { return this._key; }

    public get isBind() { return this._isBind; }

    public get isLoad() { return this._isLoad; }

    public get isRoot() { return this._isRoot; }

    public get parent() { return this._parent; }

    public get root(): Model { 
        if (this.parent) {
            return this.parent.agent.route.root;
        }
        return this.model;
    }



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


    public load() {
        this.agent.child.load();
        this.agent.event.load();
        this.agent.state.load();
        this._isLoad = true;
    }

    public unload() {
        this._isLoad = false;
        this.agent.child.unload();
        this.agent.refer.unload();
        this.agent.event.unload();
        this.agent.state.unload();
    }


    @DebugService.log()
    public static boot<T extends Model>(root: T): T {
        console.log('boot', root.name)
        root.agent.route._isRoot = true;
        root.agent.route.bind(undefined, 'root')
        return root;
    }
}
