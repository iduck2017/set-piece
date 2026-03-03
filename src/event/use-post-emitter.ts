import { Constructor, Method } from "../types";
import { Model } from "../model";
import { Event } from "./event";

export function usePostEmitter<
    P extends any,
    R extends any,
    E extends Event
>(
    selector: () => Constructor<E, [{ options: P, result: R }]>
) {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<Method<R, [P]>>
    ) {
        const method = descriptor.value;
        if (!method) return descriptor;
        descriptor.value = function(this: Model, options: P): R {
            const type = selector();
            const result = method.call(this, options);
            const event = new type({ options, result });
            this.emitEvent(event, { isYield: true });
            return result;
        }
    }
}