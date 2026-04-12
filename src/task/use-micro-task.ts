import { Method } from "../types";
import { microTaskManager } from "./micro-task-manager";

export function useMicroTask() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method>,
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(...args: any[]) {
            const _handler = handler.bind(this, ...args)
            const result = microTaskManager.run(_handler);
            return result;
        }
        return descriptor;
    }
}
