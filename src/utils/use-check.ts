import { Model } from "../model";
import { Method } from "../types";

export function useCheck<
    M extends Model,
    R extends any,
    P extends any[]
>(validator: (self: M) => any) {
    return function(
        prototype: M,
        key: string,
        descriptor: TypedPropertyDescriptor<Method<R | undefined, P>>
    ) {
        const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(this: M, ...args: P) {
            const flag = Boolean(validator(this));
            if (!flag) return;
            return handler.call(this, ...args);
        }
        return descriptor;
    }
}