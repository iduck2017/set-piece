import { Method } from "../types";
import { actionManager } from "../effect/action-manager";

/**
 * Create a method decorator that opens an action boundary.
 *
 * Use this on methods that mutate reactive state. The outermost action call
 * runs the method first, then asks `ActionManager` to flush effects and
 * producer resolvers.
 *
 * @returns Method decorator for action-scoped methods.
 */
export function useAction() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: unknown[]) {
            const _handler = handler.bind(this, ...args);
            const output = actionManager.launch(_handler);
            return output;
        };
        return descriptor;
    };
}
