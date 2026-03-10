import { Model } from "../model";
import { Constructor } from "../types";

export type StorageRegistry = Map<string, Constructor<Model>> & Map<Constructor<Model>, string>;

export const storageRegistry: StorageRegistry = new Map();

export function useStorage(code: string) {
    return function(
        prototype: Model
    ) {
        const constructor: any = prototype.constructor;
        storageRegistry.set(code, constructor);
        storageRegistry.set(constructor, code)
    }
}