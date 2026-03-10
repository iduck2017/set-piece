import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { getDescriptor } from "../utils/get-descriptor";

/** model constructor -> key -> config */
export type ChildIterator = (model: Model & Record<string, any>, key: string) => Model[];
export type ChildRegistry = Map<Function, Map<string, ChildIterator>>

const childRegistry: ChildRegistry = new Map();

export function useCustomChild<
    M extends Model & Record<string, any>,
    K extends string
>(iterator: ChildIterator) {
    return function(
        prototype: M,
        key: K,
    ) {
        const constructor = prototype.constructor;
        const iteratorMap: Map<string, ChildIterator> = childRegistry.get(constructor) ?? new Map();
        iteratorMap.set(key, iterator);
        childRegistry.set(constructor, iteratorMap);
    }
}

export function listChild(model: Model): Model[] {
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