import { decorConsumerResolver } from "../decor/decor-consumer-resolver";
import { effectResolver } from "../effect/effect-resolver";
import { eventConsumerResolver } from "../event/event-consumer-resolver";
import { eventProducerResolver } from "../event/event-producer-resolver";
import { frameConsumerResolver } from "../frame/frame-consumer-resolver";
import { frameProducerResolver } from "../frame/frame-producer-resolver";
import { memoResolver } from "../memo/memo-resolver";
import { Tag } from "../tag/tag-registry";
import { useBlink } from "../hooks/use-blink";

class DepService {
    /**
     * Fan out one changed dependency to every resolver that tracks deps.
     *
     * Reactive setters call this after a value changes. Each resolver decides
     * whether the changed tag affects its own graph.
     *
     * @param tag - Dependency tag whose value changed.
     * @returns Nothing.
     */
    @useBlink()
    public register(tag: Tag) {
        memoResolver.register(tag);
        effectResolver.register(tag);
        decorConsumerResolver.register(tag);
        eventConsumerResolver.register(tag);
        eventProducerResolver.register(tag);
        frameConsumerResolver.register(tag);
        frameProducerResolver.register(tag);
    }
}
export const depService = new DepService();
