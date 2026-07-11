import { depRegistry } from "../dep/dep-registry";
import { Model } from "../model";

/**
 * Create a decorator for reactive dependency state.
 *
 * On a property, reads are collected by active consumers and writes notify the
 * dependency service. On a getter, only dependency collection is added.
 *
 * @returns Property or accessor decorator for dependency-backed state.
 */
export function useDep<
    M extends Record<string, any> & Model,
    K extends string
>() {
    return function(
        prototype: M,
        key: K,
        descriptor?: TypedPropertyDescriptor<M[K]>
    ) {
        depRegistry.register(prototype, key, descriptor);
    }
}
