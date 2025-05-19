import { Model } from "@/model";
import { Agent } from ".";
import { TranxService } from "@/service/tranx";

export class RouteAgent<
    P extends Model = Model,
    M extends Model = Model
> extends Agent<M> {
    
    private _path: string | undefined;
    public get path(): string | undefined { return this._path; }

    private _parent: P | undefined;
    public get parent(): P | undefined { return this._parent; }

    private _isBind: boolean;
    public get isBind(): boolean { return this._isBind; }

    constructor(target: M) {
        super(target);
        this._isBind = false;
    }

    @TranxService.span()
    public bind(parent: P | undefined, path: string) {
        this._isBind = true;
        this._path = path;
        this._parent = parent;
    }

    @TranxService.span()
    public unbind() {
        this._isBind = false;
        this._path = undefined;
        this._parent = undefined;
    }
}
