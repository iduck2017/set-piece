import { Model } from "../model";

export const reloadHookRegistry = new Map<Function, string[]>();

export function useReloadHook() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ) {
        const constructor = prototype.constructor;
        const keys = reloadHookRegistry.get(constructor) ?? [];
        keys.push(key);
        reloadHookRegistry.set(constructor, keys);
    }
}

export function getReloadHooks(model: Model) {
    let constructor = model.constructor;
    const result: Array<() => void> = [];
    while (constructor) {
        const keys = reloadHookRegistry.get(constructor) ?? [];
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


export function runReloadHooks(model: Model) {
    const reloadHooks = getReloadHooks(model);
    reloadHooks.forEach(hook => hook.call(model));
}