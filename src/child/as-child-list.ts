import { Model } from "../model"
import { TypedPropertyDecorator } from "../types"
import { getDescriptor } from "../utils/get-descriptor";
import { asCustomChild } from "./as-custom-child"

export function asChildList<
    M extends Model & Record<string, any>,
    K extends string
>(): 
    M[K] extends Array<Model | undefined> | undefined ? 
    TypedPropertyDecorator<M, K> :
    TypedPropertyDecorator<never, never> {
    return function(
        prototype: M,
        key: K,
    ) {
        asCustomChild((model: Model & Record<string, unknown>, key: string) => {
            const value = model[key];
            const result: Model[] = [];
            if (value instanceof Array) {
                value.forEach(item => {
                    if (item instanceof Model) result.push(item);
                });
            }
            return result;
        })(prototype, key);
        const { setter, getter } = getDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get() {
                return getter.call(this);
            },
            set(this: Model, value) {
                console.log('Set child', key, value);
                const prev: unknown = Reflect.get(this, key);
                setter.call(this, value);
                const next: unknown = Reflect.get(this, key);
                if (prev instanceof Array) {
                    prev.forEach(item => {
                        if (item instanceof Model) item._internal.unbindParent();
                    });
                }
                if (next instanceof Array) {
                    next.forEach(item => {
                        if (item instanceof Model) item._internal.bindParent(this);
                    });
                }
            },
            enumerable: true,
            configurable: true,
        });
    }
}   
 