import { Method } from "../types";
import { microActionManager } from "./micro-action-manager";

export function useMicroAction() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: any[]) {
            const _handler = handler.bind(this, ...args)
            const result = microActionManager.run(_handler);
            return result;
        }
        return descriptor;
    }
}
