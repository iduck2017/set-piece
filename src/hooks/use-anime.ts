import { frameResolver } from "../frame/frame-resolver";
import { Method } from "../types";

/**
 * Create a method decorator that opens an anime boundary.
 *
 * Use this on methods that may emit frames. Frames are queued during the method
 * call and delivered by `FrameResolver` after the outermost anime call
 * completes.
 *
 * @returns Method decorator for frame-producing methods.
 */
export function useAnime() {
    return function(
        _prototype: unknown,
        _key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: unknown[]) {
            const _handler = handler.bind(this, ...args);
            return frameResolver.launch(_handler);
        }
        return descriptor;
    }
}
