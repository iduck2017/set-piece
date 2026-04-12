import { PostEvent, PrevEvent } from ".";
import { Model } from "../model";
import { Constructor, Method } from "../types";

export type EventProducerLoader<P, R> = () => [
    prevEvent: Constructor<PrevEvent<P>> | undefined,
    postEvent: Constructor<PostEvent<P, R>> | undefined
]

export function useEventProducer<P, R>(
    loader: EventProducerLoader<P, R>
) {
    return function(
        prototype: Model,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method<R | undefined, [P, PrevEvent<P> | undefined]>>
    ) {
       const method = descriptor.value;
        if (!method) return descriptor;
        descriptor.value = function(
            this: Model, 
            options: P, 
            event: PrevEvent<P> | undefined
        ) {
            const [prevEventType, postEventType] = loader();
            const prevEvent = prevEventType ? new prevEventType({ options }) : undefined;
            const postEvent = postEventType ? new postEventType({ options }) : undefined;
            if (prevEvent) this.emit(prevEvent);
            if (prevEvent?.isAborted) return;
            const result = method.call(this, options, prevEvent);
            if (postEvent) this.emit(postEvent, { isYield: true });
            return result
        }
    }
}