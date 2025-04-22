import { Model } from "@/model";
import { Agent } from "@/agent/index";
import { ReferAgent } from "@/agent/refer";

export class TrxContext {
    private constructor() {}

    private static isActived: boolean = false;

    private static models: Model[] = [];

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
                    if (!TrxContext.models.includes(model)) TrxContext.models.push(model)
                    if (TrxContext.isActived) return handler.apply(this, args);
                    TrxContext.isActived = true;
                    console.group(this.target.constructor.name + ":useTrx")
                    const result = handler.apply(this, args);
                    console.log('registry', TrxContext.models)
                    TrxContext.commit();
                    TrxContext.reset();
                    TrxContext.isActived = false;
                    TrxContext.models = [];
                    console.groupEnd();
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

    private static commit() {
        const models = TrxContext.models
        models.forEach(model => model.agent.child.commitBefore());
        models.forEach(model => model.agent.child.commit());
        models.forEach(model => model.agent.child.commitDone());
        models.forEach(model => model.agent.refer.commit());
        models.forEach(model => model.agent.state.commit());
    }

    private static reset() {
        const models = TrxContext.models
        models.forEach(model => model.agent.child.reset());
        models.forEach(model => model.agent.refer.reset());
        models.forEach(model => model.agent.state.reset());
    }

}