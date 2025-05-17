import { Model } from "@/model";
import { Agent } from "../agent";
import { DebugService } from "@/service/debug";
import { TranxService } from "@/service/tranx";

export enum ModelStatus {
    INIT = 0,
    BIND = 2,
    LOAD = 3,
}

@DebugService.is(target => target.target.constructor.name)
export class ModelCycle<
    P extends Model = Model,
    M extends Model = Model
> {
    public status: ModelStatus;

    public target: Model;

    constructor(target: M) {
        this.status = ModelStatus.INIT;
        this.target = target;
    }
    
    public init() {
        this.target._agent.refer.init();
    }

    public bind(parent: P | undefined, path: string | number) {
        this.target._agent.route.bind(parent, path);
        this.status = ModelStatus.BIND;
        if (parent?._cycle.status === ModelStatus.LOAD) this.load();
    }

    public unbind() {
        if (this.status === ModelStatus.LOAD) this.unload();
        this.target._agent.route.unbind();
        this.status = ModelStatus.INIT;
    }

    public reload() {
        this.unload();
        this.load();
    }

    @DebugService.log()
    public load() {
        this.target._agent.child.load();
        this.target._agent.event.load();
        this.target._agent.state.load();
        this.status = ModelStatus.LOAD;
    }

    @TranxService.span()
    @DebugService.log()
    public unload() {
        this.target._agent.child.unload();
        this.target._agent.event.unload();
        this.target._agent.state.unload();
        this.status = ModelStatus.BIND;
    }

    @DebugService.log()
    public uninit() {
        console.log('uninit:', this.target.constructor.name)
        this.target._agent.child.uninit();
        this.target._agent.refer.uninit();
        this.target._agent.event.uninit();
        this.target._agent.state.uninit();
    }

    public static boot<T extends Model>(root: T): T {
        root._cycle.bind(undefined, 'root')
        root._cycle.load()
        return root;
    }
}