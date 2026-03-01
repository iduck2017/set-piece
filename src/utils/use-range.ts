import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { getDescriptor } from "./get-descriptor";

export function useRange<
    M extends Model & Record<string, any>,
    K extends string
>(
    minimum: number | undefined,
    maximum: number | undefined,
): M[K] extends number ? 
    TypedPropertyDecorator<M, K> : 
    TypedPropertyDecorator<never, never> {
    return function(
        prototype: M,
        key: K,
    ) {
        const { getter, setter } = getDescriptor(prototype, key);   
        Object.defineProperty(prototype, key, {
            get() {
                return getter.call(this);
            },
            set(value) {
                if (maximum !== undefined && value > maximum) value = maximum;
                if (minimum !== undefined && value < minimum) value = minimum;
                setter.call(this, value);
            }
        })
    }
}