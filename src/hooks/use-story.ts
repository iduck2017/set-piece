import { eventResolver } from "../event/event-resolver";
import { Method } from "../types";

/**
 * Create a method decorator that opens a story boundary.
 *
 * Use this around methods that may queue deferred events. The outermost story
 * call runs the method first, then flushes deferred events synchronously.
 *
 * @returns Method decorator for story-scoped methods.
 */
export function useStory() {
    return function(
        _prototype: unknown,
        _key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: unknown[]) {
            const _handler = handler.bind(this, ...args);
            return eventResolver.launch(_handler);
        }
        return descriptor;
    }
}
