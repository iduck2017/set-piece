import { Model } from "../model";

export const loadHookRegistry = new Map<Function, string[]>();

export function onLoad() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ) {
        const constructor = prototype.constructor;
        const keys = loadHookRegistry.get(constructor) ?? [];
        keys.push(key);
        loadHookRegistry.set(constructor, keys);
    }
}

export function getLoadHooks(model: Model) {
    let constructor = model.constructor;
    const result: Array<() => void> = [];
    while (constructor) {
        const keys = loadHookRegistry.get(constructor) ?? [];
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


export function runLoadHooks(model: Model) {
    const loadHooks = getLoadHooks(model);
    loadHooks.forEach(hook => hook.call(model));
}
