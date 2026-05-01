import { Method } from "../types";
import { actionManager } from "./action-manager";

export function useAction() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: unknown[]) {
            const _handler = handler.bind(this, ...args)
            const result = actionManager.run(_handler);
            return result
        }
        return descriptor;
    }
}


export function runAction(handler: Method) {
    return actionManager.run(handler);
}