import { PostEvent, PrevEvent } from ".";
import { Model } from "../model";
import { Constructor, Method } from "../types";

export type EventProducerLoader<P, R> = () => [
    prevEvent: Constructor<PrevEvent<P>> | undefined,
    postEvent: Constructor<PostEvent<P, R>> | undefined
]

export function useEventProducer<P, R, E extends PrevEvent<P>>(
    loader: EventProducerLoader<P, R>
) {
    return function(
        prototype: Model,
        key: unknown,
        descriptor: TypedPropertyDescriptor<Method<R | undefined, [P, E | undefined]>>
    ) {
       const handler = descriptor.value;
        if (!handler) return descriptor;
        descriptor.value = function(
            this: Model, 
            options: P, 
            event: E | undefined
        ) {
            const [prevEventType, postEventType] = loader();
            const prevEvent: any = prevEventType ? new prevEventType({ options }) : undefined;
            const postEvent = postEventType ? new postEventType({ options }) : undefined;
            if (prevEvent) this.emitEvent(prevEvent);
            if (prevEvent?.isAborted) return;
            const result = handler.call(this, options, prevEvent);
            if (postEvent) this.emitDeferEvent(postEvent);
            return result
        }
    }
}