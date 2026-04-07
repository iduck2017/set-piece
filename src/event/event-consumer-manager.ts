import { Event } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Field } from "../utils/field-registry";

export type EventConsumerFieldsMapByType = Map<Constructor<Event>, Array<Field>>
class EventConsumerManager {
    private _context: WeakMap<Model, EventConsumerFieldsMapByType> = new WeakMap();

    public bind(
        eventProducer: Model,
        eventType: Constructor<Event>,
        eventConsumerField: Field,
    ) {
        const subContext: EventConsumerFieldsMapByType = this._context.get(eventProducer) ?? new Map();
        const eventConsumerFields = subContext.get(eventType) ?? [];
        eventConsumerFields.push(eventConsumerField);
        subContext.set(eventType, eventConsumerFields);
        this._context.set(eventProducer, subContext);
    }

    public unbind(
        eventProducer: Model,
        eventType: Constructor<Event>,
        eventConsumerField: Field,
    ) {
        const subContext: EventConsumerFieldsMapByType = this._context.get(eventProducer) ?? new Map();
        const eventConsumerFields = subContext.get(eventType) ?? [];
        const index = eventConsumerFields.indexOf(eventConsumerField);
        if (index === -1) return;
        eventConsumerFields.splice(index, 1);
        subContext.set(eventType, eventConsumerFields);
        this._context.set(eventProducer, subContext);
    }

    public query(eventProducer: Model): EventConsumerFieldsMapByType
    public query(eventProducer: Model, event: Event): Array<Field>
    public query(
        eventProducer: Model,
        event?: Event
    ) {
        if (!event) return this._context.get(eventProducer) ?? new Map();
        const eventType: any = event.constructor;
        const subContext: EventConsumerFieldsMapByType = this._context.get(eventProducer) ?? new Map();
        const eventConsumerFields = subContext.get(eventType) ?? [];
        return eventConsumerFields;
    }
}

export const eventConsumerManager = new EventConsumerManager();
