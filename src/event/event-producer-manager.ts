import { Event } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Field } from "../utils/field-registry";

export type EventTypesMapByProducer = Map<Model, Constructor<Event>[]>
class EventProducerManager {
    private _context: WeakMap<Field, EventTypesMapByProducer> = new WeakMap();

    public bind(
        eventConsumerField: Field,
        eventProducer: Model,
        eventType: Constructor<Event>,
    ) {
        const subContext: EventTypesMapByProducer = this._context.get(eventConsumerField) ?? new Map();
        const eventTypes = subContext.get(eventProducer) ?? [];
        if (eventTypes.includes(eventType)) return;
        eventTypes.push(eventType);
        subContext.set(eventProducer, eventTypes);
        this._context.set(eventConsumerField, subContext);
    }

    public unbind(eventConsumerField: Field) {
        this._context.delete(eventConsumerField);
    }

    public query(eventConsumerField: Field): EventTypesMapByProducer {
        return this._context.get(eventConsumerField) ?? new Map();
    }
}

export const eventProducerManager = new EventProducerManager();
