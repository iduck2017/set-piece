import { Event } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

export type EventConstructorsMap = Map<Model, Constructor<Event>[]>
class EventProducerManager {
    private _context: WeakMap<Tag, EventConstructorsMap> = new WeakMap();

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

    public remove(eventConsumerTag: Tag) {
        this._context.delete(eventConsumerTag);
    }

    public query(eventConsumerTag: Tag): EventConstructorsMap {
        return this._context.get(eventConsumerTag) ?? new Map();
    }
}

export const eventProducerManager = new EventProducerManager();
