import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { getDescriptor } from "../utils/get-descriptor";

/** model constructor -> key -> config */
type ChildIterator = (model: Model & Record<string, any>, key: string) => Model[];
type ChildRegistry = Map<Function, Map<string, ChildIterator>>

const childRegistry: ChildRegistry = new Map();

function registerChild(model: Model, key: string, iterator: ChildIterator) {
    const constructor = model.constructor;
    const iteratorMap: Map<string, ChildIterator> = childRegistry.get(constructor) ?? new Map();
    iteratorMap.set(key, iterator);
    childRegistry.set(constructor, iteratorMap);
}

export function asCustomChild<
    M extends Model & Record<string, any>,
    K extends string
>(iterator: ChildIterator) {
    return function(
        prototype: M,
        key: K,
    ) {
        registerChild(prototype, key, iterator);
    }
}


export function listChild(model: Model) {
    let constructor = model.constructor;
    const result: Model[] = [];
    while (constructor) {
        const iteratorMap: Map<string, ChildIterator> = childRegistry.get(constructor) ?? new Map();
        iteratorMap.forEach((iterator, key) => {
            const children = iterator(model, key);
            result.push(...children);
        });
        constructor = Object.getPrototypeOf(constructor);
    }
    return result;
}