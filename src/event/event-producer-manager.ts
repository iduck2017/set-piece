import { Event } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

export type EventConstructorsMap = Map<Model, Constructor<Event>[]>
class EventProducerManager {
    private _context: WeakMap<Tag, EventConstructorsMap> = new WeakMap();

    /**
     * Remember which producers a consumer tag is currently bound to.
     *
     * This reverse index lets `eventService.unbind()` remove old links without
     * scanning every producer model.
     *
     * @param eventConsumerTag - Tag pointing to the consumer method.
     * @param eventProducerModel - Producer model selected by the consumer.
     * @param eventType - Event constructor selected by the consumer.
     * @returns Nothing.
     */
    public add(
        eventConsumerTag: Tag,
        eventProducerModel: Model,
        eventType: Constructor<Event>,
    ) {
        const subContext: EventConstructorsMap = this._context.get(eventConsumerTag) ?? new Map();
        const eventTypes = subContext.get(eventProducerModel) ?? [];
        if (eventTypes.includes(eventType)) return;
        eventTypes.push(eventType);
        subContext.set(eventProducerModel, eventTypes);
        this._context.set(eventConsumerTag, subContext);
    }

    /**
     * Drop all producer bindings owned by a consumer tag.
     *
     * @param eventConsumerTag - Tag whose reverse bindings should be cleared.
     * @returns Nothing.
     */
    public remove(eventConsumerTag: Tag) {
        this._context.delete(eventConsumerTag);
    }

    /**
     * Return producer bindings owned by a consumer tag.
     *
     * @param eventConsumerTag - Consumer method tag to inspect.
     * @returns Map from producer model to event constructors.
     */
    public query(eventConsumerTag: Tag): EventConstructorsMap {
        return this._context.get(eventConsumerTag) ?? new Map();
    }
}

export const eventProducerManager = new EventProducerManager();
