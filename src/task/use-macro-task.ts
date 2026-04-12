import { Method } from "../types";
import { macroTaskManager } from "./macro-task-manager";

export function useMacroTask() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: unknown[]) {
            const _handler = handler.bind(this, ...args)
            const result = macroTaskManager.run(_handler);
            return result
        }
        return descriptor;
    }
}
