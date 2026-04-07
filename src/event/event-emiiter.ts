import { Model } from "../model";
import { Event } from ".";
import { eventConsumerManager } from "./event-consumer-manager";

class EventEmitter {
    public emitSync(eventProducer: Model, event: Event) {
        const eventConsumerFields = eventConsumerManager.query(eventProducer, event);
        eventConsumerFields.forEach(eventConsumerField => {
            const [eventConsumer, key] = eventConsumerField;
            const handler = Reflect.get(eventConsumer, key);
            if (handler instanceof Function) handler.call(eventConsumer, event);
        });
    }

    public async emitAsync(eventProducer: Model, event: Event) {
        const eventConsumerFields = eventConsumerManager.query(eventProducer, event);
        for (const eventConsumerField of eventConsumerFields) {
            const [eventConsumer, key] = eventConsumerField;
            const handler = Reflect.get(eventConsumer, key);
            if (handler instanceof Function) await handler.call(eventConsumer, event);
        }
    }
}

export const eventEmitter = new EventEmitter();
