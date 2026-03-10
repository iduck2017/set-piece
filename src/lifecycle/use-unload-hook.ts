import { Model } from "../model";

export const unloadHookRegistry = new Map<Function, string[]>();

export function useUnloadHook() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ) {
        const constructor = prototype.constructor;
        const keys = unloadHookRegistry.get(constructor) ?? [];
        keys.push(key);
        unloadHookRegistry.set(constructor, keys);
    }
}

export function getUnloadHooks(model: Model) {
    let constructor = model.constructor;
    const result: Array<() => void> = [];
    while (constructor) {
        const keys = unloadHookRegistry.get(constructor) ?? [];
        keys.forEach(key => {
            const method = Reflect.get(model, key);
            if (method instanceof Function) {
                result.push(method);
            }
        });
        constructor = Object.getPrototypeOf(constructor);
    }
    return result;
}


export function runUnloadHooks(model: Model) {
    const unloadHooks = getUnloadHooks(model);
    unloadHooks.forEach(hook => hook.call(model));
}
