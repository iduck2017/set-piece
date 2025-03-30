import { Model } from "@/model/model";
import { Worker } from "@/worker";
export declare class TransactionContext {
    private constructor();
    private static isActived;
    private static registry;
    static in(): (target: Model | Worker, key: string, descriptor: TypedPropertyDescriptor<(...args: any) => any>) => TypedPropertyDescriptor<(...args: any) => any>;
}
