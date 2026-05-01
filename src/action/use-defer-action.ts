import { Method } from "../types";
import { actionManager } from "./action-manager";

export function useDeferAction() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method<void>>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: any[]) {
            const _handler = handler.bind(this, ...args)
            actionManager.then(_handler);
        }
        return descriptor;
    }
}
