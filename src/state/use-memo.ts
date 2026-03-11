import { getChangeEventTypes } from "../event/use-observer";
import { Model } from "../model";
import { appendCoroutine } from "../transaction/use-coroutine";
import { delegatorContext, getDescriptor } from "../utils/get-descriptor";

const meomoRegistry = new WeakMap<Function, string[]>();

export function useMemo() {
    return function(
        prototype: Model,
        key: string,
        descriptor: PropertyDescriptor
    ) {
        const memoryKeys = meomoRegistry.get(prototype.constructor) ?? [];
        memoryKeys.push(key);
        meomoRegistry.set(prototype.constructor, memoryKeys);

        const getter = descriptor.get;
        if (!getter) return;
        descriptor.get = function(this: Model) {
            const delegator = delegatorContext.get(this) ?? new Map();
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

function getMemoKeys(model: Model) {
    let constructor = model.constructor;
    const result: string[] = [];
    while (constructor) {
        const keys = meomoRegistry.get(constructor) ?? [];
        keys.forEach(key => {
            result.push(key);
        });
        constructor = Object.getPrototypeOf(constructor);
    }
    return result;
}

export function resetMemo(model: Model) {
    const delegator = delegatorContext.get(model);
    if (!delegator) return;
    const memoMap: Map<string, any> = new Map();
    /** Clean memory */
    const memoKeys = getMemoKeys(model);
    memoKeys.forEach(key => {
        const prev = Reflect.get(model, key);
        memoMap.set(key, prev);
        delegator.delete(key);
    });
    /** Force reload memory */
    memoKeys.forEach(key => {
        const prev = memoMap.get(key);
        appendCoroutine(() => {
            const next = Reflect.get(model, key);
            if (prev !== next) {
                const types = getChangeEventTypes(model, key);
                console.log('Diff memory', key, prev, next, types);
                types.forEach(type => {
                    const event = new type({ prev, next });
                    model._internal.emit(event, {
                        isYield: true
                    });
                });
            }
        })
    })
}