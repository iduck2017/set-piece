import { Model } from "../model";

export const delegatorMap = new WeakMap<Model, Map<string, any>>();

export function getDescriptor(prototype: Model, key: string) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
    const setter = descriptor?.set ?? function(this: Model, value: any) {
        const record = delegatorMap.get(this) ?? new Map();
        record.set(key, value);
        delegatorMap.set(this, record);
    };
    const getter = descriptor?.get ?? function(this: Model) {
        const record = delegatorMap.get(this) ?? new Map();
        return record.get(key);
    };
    return { setter, getter };
}