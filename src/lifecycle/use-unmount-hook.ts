import { Model } from "../model";

export const unmountHookRegistry = new Map<Function, string[]>();

export function useUnmountHook() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ) {
        const constructor = prototype.constructor;
        const keys = unmountHookRegistry.get(constructor) ?? [];
        keys.push(key);
        unmountHookRegistry.set(constructor, keys);
    }
}

export function getUnmountHooks(model: Model) {
    let constructor = model.constructor;
    const result: Array<() => void> = [];
    while (constructor) {
        const keys = unmountHookRegistry.get(constructor) ?? [];
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

export function runUnmountHooks(model: Model) {
    const unmountHooks = getUnmountHooks(model);
    unmountHooks.forEach(hook => hook.call(model));
}
