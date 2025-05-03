import { Model } from "@/model";
import { Agent } from "@/agent/index";
import { ReferAgent } from "@/agent/refer";

export class TrxContext {
    private constructor() {}

    private static isActived: boolean = false;

    private static modelUpdate: Model[] = [];
    
    private static modelDestroy: Model[] = [];

    static use() {
        return function(
            target: Model | Agent,
            key: string,
            descriptor: TypedPropertyDescriptor<(...args: any) => any>
        ): TypedPropertyDescriptor<(...args: any) => any> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Model | Agent, ...args: any[]) {
                    const model = this.target;
                    if (!TrxContext.modelUpdate.includes(model)) TrxContext.modelUpdate.push(model)
                    if (TrxContext.isActived) return handler.apply(this, args);
                    TrxContext.isActived = true;
                    console.group(this.target.constructor.name + ":useTrx")
                    const result = handler.apply(this, args);
                    console.log('registry', TrxContext.modelUpdate)
                    TrxContext.commit();
                    TrxContext.reset();
                    TrxContext.isActived = false;
                    TrxContext.modelUpdate = [];
                    console.groupEnd();
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

    static recycle(model: Model) {
        if (TrxContext.modelDestroy.includes(model)) return;
        TrxContext.modelDestroy.push(model);
    }

    private static destroy() {
        const models = TrxContext.modelDestroy;
        for (const model of models) {
            const childAgent = model.agent.child;
            if (childAgent.isLoad) continue;
            childAgent.destroy();
        }
    }

    private static commit() {
        const models = TrxContext.modelUpdate
        models.forEach(model => model.agent.child.commitBefore());
        models.forEach(model => model.agent.child.commit());
        models.forEach(model => model.agent.child.commitDone());
        TrxContext.destroy();
        models.forEach(model => model.agent.refer.commit());
        models.forEach(model => model.agent.state.commit());
    }

    private static reset() {
        const models = TrxContext.modelUpdate
        models.forEach(model => model.agent.child.reset());
        models.forEach(model => model.agent.refer.reset());
        models.forEach(model => model.agent.state.reset());
    }

}