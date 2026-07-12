import { Event } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

type EventConsumerTagsMap = Map<Constructor<Event>, Array<Tag>>
/**
 * Stores runtime event producer-to-consumer links.
 */
class EventConsumerManager {
    private _links: WeakMap<Model, EventConsumerTagsMap> = new WeakMap();

    /**
     * Link one producer model and event type to one consumer method tag.
     *
     * This is the producer-to-consumer runtime index used by event emission.
     *
     * @param producer - Model that may emit the event.
     * @param type - Event constructor the consumer is interested in.
     * @param consumerTag - Tag pointing to the consumer method.
     * @returns Nothing.
     */
    public add(
        producer: Model,
        type: Constructor<Event>,
        consumerTag: Tag,
    ) {
        const links: EventConsumerTagsMap = this._links.get(producer) ?? new Map();
        const consumerTags = links.get(type) ?? [];
        consumerTags.push(consumerTag);
        links.set(type, consumerTags);
        this._links.set(producer, links);
    }

    /**
     * Remove one producer/event/consumer runtime link.
     *
     * This is called when a consumer is unbound because its loader dependencies
     * changed.
     *
     * @param producer - Producer model that owns the runtime link.
     * @param type - Event constructor for the runtime link.
     * @param consumerTag - Consumer method tag to remove.
     * @returns Nothing.
     */
    public remove(
        producer: Model,
        type: Constructor<Event>,
        consumerTag: Tag,
    ) {
        const links: EventConsumerTagsMap = this._links.get(producer) ?? new Map();
        const consumerTags = links.get(type) ?? [];
        const index = consumerTags.indexOf(consumerTag);
        if (index === -1) return;
        consumerTags.splice(index, 1);
        links.set(type, consumerTags);
        this._links.set(producer, links);
    }

    /**
     * Return event consumer links for a producer.
     *
     * Without an event, this returns the full event-type map. With an event,
     * this returns only consumer tags bound to that event constructor.
     *
     * @param producer - Producer model whose links should be read.
     * @param event - Optional emitted event used to filter by constructor.
     * @returns Either the full link map or the matching consumer tags.
     */
    public query(producer: Model): EventConsumerTagsMap
    public query(producer: Model, event: Event): Array<Tag>
    public query(
        producer: Model,
        event?: Event
    ) {
        if (!event) return this._links.get(producer) ?? new Map();
        const type: any = event.constructor;
        const links: EventConsumerTagsMap = this._links.get(producer) ?? new Map();
        const consumerTags = links.get(type) ?? [];
        return [...consumerTags];
    }
}

export const eventConsumerManager = new EventConsumerManager();
