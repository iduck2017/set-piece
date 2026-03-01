import { Model } from "../model";
import { Method } from "../types";

export function useValidator<
    M extends Model,
    R extends any,
    P extends any[]
>(validator: (self: M) => any) {
    return function(
        prototype: M,
        key: string,
        descriptor: TypedPropertyDescriptor<Method<R | undefined, P>>
    ) {
        const method = descriptor.value;
        if (!method) return descriptor;
        descriptor.value = function(this: M, ...args: P) {
            const flag = Boolean(validator(this));
            if (!flag) return;
            return method.call(this, ...args);
        }
        return descriptor;
    }
}