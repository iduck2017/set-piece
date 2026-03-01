import { Model } from "../model";

export const stateRegistry = new Map<Function, string[]>();

export function asState<
    M extends Model & Record<string, any>,
    K extends string
>() {
    return function(
        prototype: M,
        key: K,
    ) {
        const constructor = prototype.constructor;
        const stateKeys = stateRegistry.get(constructor) ?? [];
        stateKeys.push(key);
        stateRegistry.set(constructor, stateKeys);
    }
}