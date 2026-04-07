import { PostEvent, PrevEvent } from ".";
import { Model } from "../model";
import { Constructor, Method } from "../types";

export type StoryConfig<P, R> = () => [
    prevEvent: Constructor<PrevEvent<P>>,
    postEvent: Constructor<PostEvent<P, R>>
]

export function useStory<P, R>(
    configurator: StoryConfig<P, R>
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
            const [prevEventType, postEventType] = configurator();
            const prevEvent = new prevEventType({ options });
            const postEvent = new postEventType({ options })
            this.emit(prevEvent);
            if (prevEvent.isAborted) return;
            const result = method.call(this, options, prevEvent);
            this.emit(postEvent, { isYield: true });
            return result
        }
    }
}