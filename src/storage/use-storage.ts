import { Model } from "../model";
import { Constructor } from "../types";

export const storageTypeRegistry = new Map<string, Constructor<Model>>();
export const storageCodeRegistry = new Map<Constructor<Model>, string>();

export function useStorage(code: string) {
    return function(
        prototype: Model
    ) {
        const constructor: any = prototype.constructor;
        storageTypeRegistry.set(code, constructor);
        storageCodeRegistry.set(constructor, code);
    }
}