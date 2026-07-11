import { Event } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

type EventConsumerTagsMap = Map<Constructor<Event>, Array<Tag>>
class EventConsumerManager {
    private _context: WeakMap<Model, EventConsumerTagsMap> = new WeakMap();

    /**
     * Link one producer model and event type to one consumer method tag.
     *
     * This is the producer-to-consumer runtime index used by event emission.
     *
     * @param eventProducerModel - Model that may emit the event.
     * @param eventType - Event constructor the consumer is interested in.
     * @param eventConsumerTag - Tag pointing to the consumer method.
     * @returns Nothing.
     */
    public add(
        eventProducerModel: Model,
        eventType: Constructor<Event>,
        eventConsumerTag: Tag,
    ) {
        const subContext: EventConsumerTagsMap = this._context.get(eventProducerModel) ?? new Map();
        const eventConsumerTags = subContext.get(eventType) ?? [];
        eventConsumerTags.push(eventConsumerTag);
        subContext.set(eventType, eventConsumerTags);
        this._context.set(eventProducerModel, subContext);
    }

    /**
     * Remove one producer/event/consumer runtime link.
     *
     * This is called when a consumer is unbound because its loader dependencies
     * changed.
     *
     * @param eventProducerModel - Producer model that owns the runtime link.
     * @param eventType - Event constructor for the runtime link.
     * @param eventConsumerTag - Consumer method tag to remove.
     * @returns Nothing.
     */
    public remove(
        eventProducerModel: Model,
        eventType: Constructor<Event>,
        eventConsumerTag: Tag,
    ) {
        const subContext: EventConsumerTagsMap = this._context.get(eventProducerModel) ?? new Map();
        const eventConsumerTags = subContext.get(eventType) ?? [];
        const index = eventConsumerTags.indexOf(eventConsumerTag);
        if (index === -1) return;
        eventConsumerTags.splice(index, 1);
        subContext.set(eventType, eventConsumerTags);
        this._context.set(eventProducerModel, subContext);
    }

    /**
     * Return event consumer links for a producer.
     *
     * Without an event, this returns the full event-type map. With an event,
     * this returns only consumer tags bound to that event constructor.
     *
     * @param eventProducerModel - Producer model whose links should be read.
     * @param event - Optional emitted event used to filter by constructor.
     * @returns Either the full link map or the matching consumer tags.
     */
    public query(eventProducerModel: Model): EventConsumerTagsMap
    public query(eventProducerModel: Model, event: Event): Array<Tag>
    public query(
        eventProducerModel: Model,
        event?: Event
    ) {
        if (!event) return this._context.get(eventProducerModel) ?? new Map();
        const eventType: any = event.constructor;
        const subContext: EventConsumerTagsMap = this._context.get(eventProducerModel) ?? new Map();
        const eventConsumerTags = subContext.get(eventType) ?? [];
        return [...eventConsumerTags];
    }
}

export const eventConsumerManager = new EventConsumerManager();
