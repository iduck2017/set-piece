import { Model } from "../model";
import { Constructor } from "../types";
import { getDescriptor } from "../utils/get-descriptor";
import { Decor, emitDecor } from "./decor";
import { getDecorSelectorsMap } from "./on-calc";

export function useDecor<
    M extends Model & Record<string, any>,
    K extends string,
>(
    selector: () => Constructor<Decor<M[K]>, [origin: M[K]]>
) {
    return function(
        prototype: M,
        key: K,
    ) {
        const { setter, getter } = getDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get() {
                const origin = getter.call(this);
                const types = selector()
                const decor = new types(origin);
                emitDecor(this, decor);
                return decor.result;
            },
            set(this: Model, value) {
                setter.call(this, value);
            },
            enumerable: true,
            configurable: true,
        });
    }
}