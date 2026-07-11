import { Event } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

export type EventConstructorsMap = Map<Model, Constructor<Event>[]>
class EventProducerManager {
    private _links: WeakMap<Tag, EventConstructorsMap> = new WeakMap();

    /**
     * Remember which producers a consumer tag is currently bound to.
     *
     * This reverse index lets `eventService.unbind()` remove old links without
     * scanning every producer model.
     *
     * @param consumerTag - Tag pointing to the consumer method.
     * @param producer - Producer model selected by the consumer.
     * @param EventCtor - Event constructor selected by the consumer.
     * @returns Nothing.
     */
    public add(
        consumerTag: Tag,
        producer: Model,
        EventCtor: Constructor<Event>,
    ) {
        const links: EventConstructorsMap = this._links.get(consumerTag) ?? new Map();
        const types = links.get(producer) ?? [];
        if (types.includes(EventCtor)) return;
        types.push(EventCtor);
        links.set(producer, types);
        this._links.set(consumerTag, links);
    }

    /**
     * Drop all producer bindings owned by a consumer tag.
     *
     * @param consumerTag - Tag whose reverse bindings should be cleared.
     * @returns Nothing.
     */
    public remove(consumerTag: Tag) {
        this._links.delete(consumerTag);
    }

    /**
     * Return producer bindings owned by a consumer tag.
     *
     * @param consumerTag - Consumer method tag to inspect.
     * @returns Map from producer model to event constructors.
     */
    public query(consumerTag: Tag): EventConstructorsMap {
        return this._links.get(consumerTag) ?? new Map();
    }
}

export const eventProducerManager = new EventProducerManager();
