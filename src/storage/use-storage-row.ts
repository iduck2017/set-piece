import { Model } from "../model";

export const storageRowRegistry = new Map<Function, Map<string, {
    parser: (value: any) => any,
    generator: (value: any) => any,
}>>();

export function useStorageRow<
    I extends Model & Record<string, any>,
    K extends string,
    R extends any
>(
    parser: (value: I[K]) => R,
    generator: (value: R) => I[K],
) {
    return function(
        prototype: I,
        key: K,
    ) {
        const strategyMap = storageRowRegistry.get(prototype.constructor) ?? new Map();
        strategyMap.set(key, { parser, generator });
        storageRowRegistry.set(prototype.constructor, strategyMap);
    }
}