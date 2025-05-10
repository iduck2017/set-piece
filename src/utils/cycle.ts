import { Model } from "@/model";
import { Agent } from "../agent";
import { ModelStatus } from "@/types/model";
import { DebugService } from "@/service/debug";

export class ModelCycle {
    public parent: Model | undefined;

    public path: string | undefined;
    
    public status: ModelStatus;

    public readonly target: Model;
    
    constructor(target: Model) {
        this.target = target;
        this.path = undefined;
        this.parent = undefined;
        this.status = ModelStatus.INIT;
    }
    
    public bind(parent: Model | undefined, path: string | number) {
        this.parent = parent;
        this.path = typeof path === 'number' ? String(0) : path;
        this.status = ModelStatus.BIND;
        
        if (parent?.status === ModelStatus.LOAD) this.load();
    }

    public unbind() {
        if (this.status === ModelStatus.LOAD) this.unload();
        this.parent = undefined;
        this.path = undefined;
        this.status = ModelStatus.INIT;
        this.destroy();
    }

    @DebugService.log()
    public load() {
        console.log('load:', this.target.constructor.name)
        this.target._agent.child.load();
        this.target._agent.event.load();
        this.target._agent.state.load();
        this.status = ModelStatus.LOAD;
    }

    @DebugService.log()
    public unload() {
        console.log('unload:', this.target.constructor.name)
        this.target._agent.child.unload();
        this.target._agent.event.unload();
        this.target._agent.state.unload();
        this.status = ModelStatus.BIND;
    }

    public destroy() {
        this.target._agent.child.destroy();
        this.target._agent.refer.destroy();
        this.target._agent.event.destroy();
        this.target._agent.state.destroy();
    }

    public static boot<T extends Model>(root: T): T {
        root._cycle.bind(undefined, 'root')
        root._cycle.load()
        return root;
    }

}