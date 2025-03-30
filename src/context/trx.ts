import { Model } from "@/model/model";
import { SubModel } from "@/submodel";

export class TrxContext {
    private constructor() {}

    private static isActived: boolean = false;

    private static models: Model[] = [];

    static use() {
        return function(
            target: Model | SubModel,
            key: string,
            descriptor: TypedPropertyDescriptor<(...args: any) => any>
        ): TypedPropertyDescriptor<(...args: any) => any> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Model | SubModel, ...args: any[]) {
                    const model = this.target;
                    if (!TrxContext.models.includes(model)) TrxContext.models.push(model)
                    if (TrxContext.isActived) return handler.apply(this, args);
                    TrxContext.isActived = true;
                    console.group(this.constructor.name + ":useFiber")
                    const result = handler.apply(this, args);
                    console.log('registry', TrxContext.models)
                    TrxContext.models.forEach(model => model.commitChild());
                    TrxContext.models.forEach(model => model.commitRefer());
                    TrxContext.models.forEach(model => model.stateModel.commit());
                    TrxContext.models.forEach(model => model.reset());
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
}