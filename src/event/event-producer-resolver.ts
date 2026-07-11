import { Model } from "../model";
import { Tag } from "../tag/tag-registry";
import { eventService } from "./event-service";
import { EventProducerLoader, eventProducerRegistry } from "./event-producer-registry";
import { useStory } from "./event-resolver";

class EventProducerResolver {
    private _context: Set<Tag> = new Set();

    public register(tag: Tag) {
        this._context.add(tag);
    }

    @useStory()
    public resolve() {
        const tags = [...this._context];
        this._context.clear();
        tags.forEach(tag => {
            const loader = eventProducerRegistry.query(tag.target, tag.key);
            if (!loader) return;
            const EventConstructor = loader();
            const model = tag.target;
            const next = Reflect.get(model, tag.key);
            const event = new EventConstructor({ next });
            eventService.emitSync(model, event);
        });
    }
}

export const eventProducerResolver = new EventProducerResolver();

export function useEventProducer<
    M extends Model & Record<string, any>,
    K extends string,
>(loader: EventProducerLoader<M[K]>) {
    return function(
        prototype: M,
        key: K,
    ) {
        eventProducerRegistry.register(prototype, key, loader);
    };
}

