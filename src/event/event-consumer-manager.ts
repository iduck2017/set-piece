import { Event } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

type EventConsumerTagsMap = Map<Constructor<Event>, Array<Tag<Model>>>
class EventConsumerManager {
    private _context: WeakMap<Model, EventConsumerTagsMap> = new WeakMap();

    public add(
        eventProducerModel: Model,
        eventType: Constructor<Event>,
        eventConsumerTag: Tag<Model>,
    ) {
        const subContext: EventConsumerTagsMap = this._context.get(eventProducerModel) ?? new Map();
        const eventConsumerTags = subContext.get(eventType) ?? [];
        eventConsumerTags.push(eventConsumerTag);
        subContext.set(eventType, eventConsumerTags);
        this._context.set(eventProducerModel, subContext);
    }

    public remove(
        eventProducerModel: Model,
        eventType: Constructor<Event>,
        eventConsumerTag: Tag<Model>,
    ) {
        const subContext: EventConsumerTagsMap = this._context.get(eventProducerModel) ?? new Map();
        const eventConsumerTags = subContext.get(eventType) ?? [];
        const index = eventConsumerTags.indexOf(eventConsumerTag);
        if (index === -1) return;
        eventConsumerTags.splice(index, 1);
        subContext.set(eventType, eventConsumerTags);
        this._context.set(eventProducerModel, subContext);
    }

    public query(eventProducerModel: Model): EventConsumerTagsMap
    public query(eventProducerModel: Model, event: Event): Array<Tag<Model>>
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
