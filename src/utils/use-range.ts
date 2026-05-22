import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { tagDelegator } from "../tag/tag-delegator";

export function useRange<
    M extends Model & Record<string, any>,
    K extends string
>(
    minimum: number | undefined,
    maximum: number | undefined,
): M[K] extends number | undefined ? 
    TypedPropertyDecorator<M, K> : 
    TypedPropertyDecorator<never, never> {
    return function(
        prototype: M,
        key: K,
    ) {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        const getter = descriptor?.get;
        const setter = descriptor?.set;
        Object.defineProperty(prototype, key, {
            get() {
                if (getter) return getter.call(this);
                return tagDelegator.get(this, key);
            },
            set(value) {
                if (typeof value === 'number') {
                    if (maximum !== undefined && value > maximum) value = maximum;
                    if (minimum !== undefined && value < minimum) value = minimum;
                }
                if (setter) setter.call(this, value);
                tagDelegator.set(this, key, value);
            },
            configurable: true,
        })
    }
}