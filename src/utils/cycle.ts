import { Model } from "@/model";
import { Agent } from "../agent";
import { DebugService } from "@/service/debug";
import { TranxService } from "@/service/tranx";

@DebugService.is(target => target.target.name)
export class ModelCycle<
    P extends Model = Model,
    M extends Model = Model
> {

    private _path: string | undefined;
    public get path(): string | undefined { return this._path; }

    private _parent: P | undefined;
    public get parent(): P | undefined { return this._parent; }

    
    
    private _isBind: boolean;
    public get isBind(): boolean { return this._isBind; }

    private _isLoad: boolean;
    public get isLoad(): boolean { return this._isLoad; }



    public readonly target: Model;

    constructor(target: M) {
        this.target = target;
        this._isBind = false;
        this._isLoad = false;
    }

    @TranxService.span()
    public bind(parent: P | undefined, path: string) {
        this._isBind = true;
        this._path = path;
        this._parent = parent;
        this.target._agent.refer.bind();
        
        if (parent?._cycle._isLoad) this.load();
    }

    @TranxService.span()
    public unbind() {
        if (this._isLoad) this.unload();
        this.target._agent.refer.unbind();
        this._parent = undefined;
        this._path = undefined;
        this._isBind = false;
    }

    @TranxService.span()
    public reload() {
        this.unload();
        this.load();
    }

    @DebugService.log()
    @TranxService.span()
    public load() {
        this._isLoad = true;
        this.target._agent.child.load();
        this.target._agent.event.load();
        this.target._agent.state.load();
    }

    @DebugService.log()
    @TranxService.span()
    public unload() {
        this.target._agent.child.unload();
        this.target._agent.event.unload();
        this.target._agent.state.unload();
        this._isLoad = false;
    }

    @DebugService.log()
    public uninit() {
        this.target._agent.child.uninit();
        this.target._agent.refer.unbind();
        this.target._agent.event.uninit();
        this.target._agent.state.uninit();
    }


    public static boot<T extends Model>(root: T): T {
        root._cycle.bind(undefined, 'root')
        root._cycle.load()
        return root;
    }
}