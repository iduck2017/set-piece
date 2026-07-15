import { memoRegistry } from "../memo/memo-registry";
import { Model } from "../model";

/**
 * Create an accessor decorator for memoized derived values.
 *
 * The getter result is cached after the first read. Dependencies read during
 * the getter are collected, and the memo is invalidated when those dependencies
 * change.
 *
 * @returns Accessor decorator for memo getters.
 */
export function useMemo() {
    return function(
        prototype: Model,
        key: string,
        descriptor: PropertyDescriptor
    ) {
        memoRegistry.register(prototype, key, descriptor);
    }
}
