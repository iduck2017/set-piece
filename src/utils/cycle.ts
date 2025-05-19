import { Model } from "@/model";
import { Agent } from "../agent";
import { DebugService } from "@/service/debug";
import { TranxService } from "@/service/tranx";

@DebugService.is(target => target.target.name)
export class ModelCycle<
    P extends Model = Model,
    M extends Model = Model
> extends Agent<M> {
    private _isLoad: boolean;
    public get isLoad(): boolean { return this._isLoad; }

    constructor(target: M) {
        super(target);
        this._isLoad = false;
    }

    public bind(parent: P | undefined, path: string) {
        this.agent.route.bind(parent, path);
        this.agent.refer.bind();
        if (parent?._cycle._isLoad) this.load();
    }

    public unbind() {
        if (this._isLoad) this.unload();
        this.agent.refer.unbind();
        this.agent.route.unbind();
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
        this.agent.child.load();
        this.agent.event.load();
        this.agent.state.load();
    }

    @DebugService.log()
    @TranxService.span()
    public unload() {
        this.agent.child.unload();
        this.agent.event.unload();
        this.agent.state.unload();
        this._isLoad = false;
    }

    @DebugService.log()
    public uninit() {
        this.agent.child.uninit();
        this.agent.refer.unbind();
        this.agent.event.uninit();
        this.agent.state.uninit();
    }


    public static boot<T extends Model>(root: T): T {
        root._cycle.bind(undefined, 'root')
        root._cycle.load()
        return root;
    }
}