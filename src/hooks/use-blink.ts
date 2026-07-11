import { Method } from "../types";
import { blinkManager } from "../utils/blink-manager";

/**
 * Create a method decorator that opens a blink boundary.
 *
 * Blink is the binding refresh phase. Use this around framework operations that
 * may change dependency graphs, such as model initialization or consumer
 * binding refresh.
 *
 * @returns Method decorator for blink-scoped methods.
 */
export function useBlink() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: any[]) {
            const _handler = handler.bind(this, ...args)
            const result = blinkManager.launch(_handler);
            return result;
        }
        return descriptor;
    }
}
