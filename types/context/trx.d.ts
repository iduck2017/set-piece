import { Model } from "@/model/model";
import { Submodel } from "@/submodel";
export declare class TrxContext {
    private constructor();
    private static isActived;
    private static models;
    static in(): (target: Model | Submodel, key: string, descriptor: TypedPropertyDescriptor<(...args: any) => any>) => TypedPropertyDescriptor<(...args: any) => any>;
}
