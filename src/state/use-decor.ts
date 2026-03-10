import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";
import { getDescriptor } from "../utils/get-descriptor";
import { Decor, emitDecor } from "./decor";
import { getDecorSelectorsMap } from "./use-modifier";

/** decor constructor -> model constructor + key */
type DecorRegistry = Map<Function, Array<[Function, string]>>;

export const decorRegistry: DecorRegistry = new Map();

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
        const constructor = prototype.constructor;
        const decorEmitters = decorRegistry.get(constructor) ?? [];
        decorEmitters.push([constructor, key]);
        decorRegistry.set(constructor, decorEmitters);

        const { setter, getter } = getDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get() {
                const origin = getter.call(this);
                const types = selector()
                const decor = new types(origin);
                // console.log('Use decor', this, key, decor);
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