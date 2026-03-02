import { Model } from "../model";
import { delegatorMap, getDescriptor } from "../utils/get-descriptor";

const memoryRegistry = new WeakMap<Function, string[]>();

export function useMemory() {
    return function(
        prototype: Model,
        key: string,
        descriptor: PropertyDescriptor
    ) {
        const memoryKeys = memoryRegistry.get(prototype.constructor) ?? [];
        memoryKeys.push(key);
        memoryRegistry.set(prototype.constructor, memoryKeys);

        const getter = descriptor.get;
        if (!getter) return;
        descriptor.get = function(this: Model) {
            const delegator = delegatorMap.get(this) ?? new Map();
            if (delegator.has(key)) {
                return delegator.get(key);
            }
            // console.log('Memory miss', key);
            const value = getter.call(this);
            delegator.set(key, value);
            return value;
        }

    }
}

function getMemoryKeys(model: Model) {
    let constructor = model.constructor;
    const result: string[] = [];
    while (constructor) {
        const keys = memoryRegistry.get(constructor) ?? [];
        keys.forEach(key => {
            result.push(key);
        });
        constructor = Object.getPrototypeOf(constructor);
    }
    return result;
}

export function clearMemories(model: Model) {
    const delegator = delegatorMap.get(model);
    if (!delegator) return;
    const memoryKeys = getMemoryKeys(model);
    memoryKeys.forEach(key => {
        // console.log('Memory clear', key)
        delegator.delete(key);
    });
}