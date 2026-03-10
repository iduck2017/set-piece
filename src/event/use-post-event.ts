import { Constructor, Method } from "../types";
import { Model } from "../model";
import { Event } from ".";

export abstract class PostEvent<P, R> extends Event {
    constructor(props: {
        options: P;
        result: R;
    }) {
        super();
        this.options = props.options;
        this.result = props.result;
    }

    public readonly options: P;
    public readonly result: R;
}

export function usePostEvent<
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
            this.emit(event, { isYield: true });
            return result;
        }
    }
}