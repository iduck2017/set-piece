import { Model } from "../model";
import { getDescriptor } from "../utils/get-descriptor";

export function useDep(depth?: number) {
    return function(
        prototype: Model,
        key: string,
    ) {
        const { getter, setter } = getDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                const model = this;
                const value = getter.call(this);
                if (depth === undefined || depth === 0) {
                    return value;
                }
                return delegateDep(value, model, depth);
            },
            set(this: Model, value) {
                const prev = Reflect.get(this, key);
                setter.call(this, value);
                const next = Reflect.get(this, key);
                if (prev !== next) {
                    // console.log('Dependency changed', key, prev, next);
                    this._internal.reload();
                }
            },
            configurable: true,
        });
    }
}

export function delegateDep(value: unknown, model: Model, depth: number) {
    if (typeof value !== 'object' || value === null || depth <= 0) {
        return value;
    }
    return new Proxy(value, {
        get(target, subkey: string) {
            const value = Reflect.get(target, subkey);
            return delegateDep(value, model, depth - 1);
        },
        set(target, subkey: string, value) {
            const prev = Reflect.get(target, subkey);
            Reflect.set(target, subkey, value);
            const next = Reflect.get(target, subkey);
            if (prev !== next) {
                model._internal.reload();
            }
            return true;
        }
    });
}
