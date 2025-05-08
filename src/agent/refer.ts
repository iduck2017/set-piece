import { Model } from "@/model";
import { Agent } from ".";
import { DebugService } from "@/service/debug";
import { ModelStatus } from "@/types/model";

export class ReferAgent<
    R1 extends Record<string, Model> = Record<string, Model>,
    R2 extends Record<string, Model[]> = Record<string, Model[]>,
    M extends Model = Model,
> extends Agent<M> {
    public get current(): Readonly<Partial<R1> & R2> {
        const result: any = {};
        for (const key of Object.keys(origin)) {
            const value = this.draft[key];
            if (value instanceof Model && value.status === ModelStatus.LOAD) result[key] = value;
            if (value instanceof Array) {
                result[key] = value.filter(model => model.status === ModelStatus.LOAD)
            }
        }
        return result;
    }

    public readonly draft: Partial<R1> & R2; 

    private readonly registry: Model[];



    constructor(
        target: M,
        props: Readonly<Partial<R1> & R2>,
    ) {
        super(target);
        this.registry = [];
        this.draft = new Proxy({ ...props }, {
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this)
        })
    }



    @DebugService.log()
    public destroy() {
        for (const model of this.registry) {
            const refer: Record<string, Model | Model[]> = model.agent.refer.draft;
            for (const key of Object.keys(refer)) {
                const value: unknown = refer[key];
                if (value instanceof Model && value === this.target) {
                    delete refer[key]
                } else if (value instanceof Array && value.includes(this.target)) {
                    refer[key] = value.filter(item => item !== this.target);
                }
            }
        }
    }


    @DebugService.log()
    private set(origin: any, key: string, next: Model | Model[]) {
        let prev = origin[key];
        if (prev instanceof Model) {
            const registry = prev.agent.refer.registry;
            const index = registry.indexOf(this.target);
            if (index !== -1) registry.splice(index, 1);
        } else if (prev instanceof Array) {
            for (const model of prev) {
                const registry = model.agent.refer.registry;
                const index = registry.indexOf(this.target);
                if (index !== -1) registry.splice(index, 1);
            }
        }
        origin[key] = next;
        if (next instanceof Model) {
            next.agent.refer.registry.push(this.target)
        } else if (next instanceof Array) {
            for (const model of next) {
                model.agent.refer.registry.push(this.target)
            }
        }
        return true;
    }

    @DebugService.log()
    private delete(origin: any, key: string) {
        let prev = origin[key];
        if (prev instanceof Model) {
            const registry = prev.agent.refer.registry;
            const index = registry.indexOf(this.target);
            if (index !== -1) registry.splice(index, 1);
        } else if (prev instanceof Array) {
            for (const model of prev) {
                const registry = model.agent.refer.registry;
                const index = registry.indexOf(this.target);
                if (index !== -1) registry.splice(index, 1);
            }
        }
        delete origin[key];
        return true;
    }
}