import { trxManager } from "../trx/trx-manager";
import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { Field } from "../utils/field-registry";
import { eventManager } from "./event-manager";
import { eventProducerManager } from "./event-producer-manager";
import { eventConsumerManager } from "./event-consumer-manager";
import { eventRegistry } from "./event-registry";

class EventResolver {
    private _context: Field[] = [];

    public register(dep: Field) {
        trxManager.run(() => {
            if (this._context.includes(dep)) return;
            this._context.push(dep);
        })
    }

    public resolve() {
        const deps = this._context;
        this._context = [];

        const eventConsumerFields: Field[] = [];
        for (const dep of deps) {
            const subEventConsumerFields = eventManager.query(dep);
            subEventConsumerFields.forEach(eventConsumerField => {
                if (eventConsumerFields.includes(eventConsumerField)) return;
                eventConsumerFields.push(eventConsumerField);
                if (deps.includes(eventConsumerField)) return;
                deps.push(eventConsumerField);
            })
        }

        // Clear relations
        eventConsumerFields.forEach(eventConsumerField => {
            const deps = depManager.query(eventConsumerField);
            eventManager.unbind(eventConsumerField);
            deps.forEach(dep => {
                depManager.unbind(eventConsumerField, dep)
            })
        })
        eventConsumerFields.forEach(eventConsumerField => {
            this.unbind(eventConsumerField);
            this.bind(eventConsumerField);
        })
    }

    public unbind(eventConsumerField: Field) {
        const eventProducers = eventProducerManager.query(eventConsumerField);
        eventProducers.forEach((eventTypes, eventProducer) => {
            eventTypes.forEach(eventType => {
                const [eventConsumer, listenerKey] = eventConsumerField;
                console.log('Unbind event listeners', eventProducer.name, eventType, eventConsumer.name, listenerKey);
                eventConsumerManager.unbind(eventProducer, eventType, eventConsumerField);
            })
        })
        eventProducerManager.unbind(eventConsumerField);
    }

    public bind(eventConsumerField: Field) {
        const [eventConsumer, eventConsumerKey] = eventConsumerField;
        const loadersMap = eventRegistry.query(eventConsumer);
        const loaders = loadersMap.get(eventConsumerKey) ?? [];
        loaders.forEach(loader => {
            const [eventProducers, eventType] = loader(eventConsumer);
            if (eventProducers instanceof Array) {
                eventProducers?.forEach(model => {
                    if (!model) return;
                    eventConsumerManager.bind(model, eventType, eventConsumerField);
                    eventProducerManager.bind(eventConsumerField, model, eventType);
                })
            }
            if (eventProducers instanceof Model) {
                eventConsumerManager.bind(eventProducers, eventType, eventConsumerField);
                eventProducerManager.bind(eventConsumerField, eventProducers, eventType);
            }
        })
    }
}

export const eventResolver = new EventResolver();
