import { Model } from "../model";

export const mountHookRegistry = new Map<Function, string[]>();

export function useMountHook() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ) {
        const constructor = prototype.constructor;
        const keys = mountHookRegistry.get(constructor) ?? [];
        keys.push(key);
        mountHookRegistry.set(constructor, keys);
    }
}

export function getMountHooks(model: Model) {
    let constructor = model.constructor;
    const result: Array<() => void> = [];
    while (constructor) {
        const keys = mountHookRegistry.get(constructor) ?? [];
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

export function runMountHooks(model: Model) {
    const mountHooks = getMountHooks(model);
    mountHooks.forEach(hook => hook.call(model));
}
