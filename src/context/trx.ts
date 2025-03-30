import { Model } from "@/model/model";
import { Submodel } from "@/submodel";

export class TrxContext {
    private constructor() {}

    private static isActived: boolean = false;

    private static models: Model[] = [];

    static use() {
        return function(
            target: Model | Submodel,
            key: string,
            descriptor: TypedPropertyDescriptor<(...args: any) => any>
        ): TypedPropertyDescriptor<(...args: any) => any> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Model | Submodel, ...args: any[]) {
                    const model = this.target;
                    if (!TrxContext.models.includes(model)) TrxContext.models.push(model)
                    if (TrxContext.isActived) return handler.apply(this, args);
                    TrxContext.isActived = true;
                    console.group(this.constructor.name + ":useFiber")
                    const result = handler.apply(this, args);
                    console.log('registry', TrxContext.models)
                    TrxContext.models.forEach(model => model.commitChild());
                    TrxContext.models.forEach(model => model.commitRefer());
                    TrxContext.models.forEach(model => model.commitState());
                    TrxContext.models.forEach(model => model.clear());
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