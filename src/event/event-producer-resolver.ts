import { Tag } from "../tag/tag-registry";
import { eventService } from "./event-service";
import { eventProducerRegistry } from "./event-producer-registry";
import { useStory } from "../hooks/use-story";

/**
 * Emits diff events for dependency-backed producer changes.
 */
class EventProducerResolver {
    private _queue: Set<Tag> = new Set();

    /**
     * Queue a producer property tag whose value changed during an action.
     *
     * `depService.register()` calls this for every reactive write. At story
     * resolution, matching producer registrations emit diff events.
     *
     * @param tag - Tag for the changed producer property.
     * @returns Nothing.
     */
    public register(tag: Tag) {
        this._queue.add(tag);
    }

    /** Report whether any producer changes are waiting to emit events. */
    public check() {
        return Boolean(this._queue.size);
    }

    /**
     * Emit diff events for all queued producer property changes.
     *
     * This runs inside the story boundary. For each changed property with a
     * registered event producer, it builds the configured diff event and emits
     * it through `eventService`.
     *
     * @returns Nothing.
     */
    @useStory()
    public resolve() {
        const tags = [...this._queue];
        this._queue.clear();
        tags.forEach(tag => {
            const loader = eventProducerRegistry.query(tag.target, tag.key);
            if (!loader) return;
            const EventCtor = loader();
            const model = tag.target;
            const event = new EventCtor();
            eventService.emit(model, event);
        });
    }
}

export const eventProducerResolver = new EventProducerResolver();
