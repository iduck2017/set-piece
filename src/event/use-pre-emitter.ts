import { Constructor, Method } from "../types";
import { Model } from "../model";
import { AbortableEvent } from "./abortable-event";

export function usePreEmitter<
    P extends any,
    R extends any,
    E extends AbortableEvent
>(
    selector: () => Constructor<E, [{ options: P }]>
) {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<Method<R | undefined, [P, E | undefined]>>
    ) {
        const method = descriptor.value;
        if (!method) return descriptor;
        descriptor.value = function(this: Model, options: P, event: E | undefined) {
            const type = selector();
            event = new type({ options });
            this.emitEvent(event);
            if (event.isAborted) return;
            return method.call(this, options, event);
        }
    }
}