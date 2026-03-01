import { Model } from "../model";
import { getDescriptor } from "../utils/get-descriptor";

export function asDependency() {
    return function(
        prototype: Model,
        key: string,
    ) {
        const { getter, setter } = getDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get() {
                return getter.call(this);
            },
            set(this: Model, value) {
                const prev = Reflect.get(this, key);
                setter.call(this, value);
                const next = Reflect.get(this, key);
                if (prev !== next) {
                    console.log('Dependency changed', key, prev, next);
                    this._internal.reload();
                }
            }
        });
    }
}