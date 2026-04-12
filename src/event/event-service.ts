import { Model } from "../model";
import { Event } from ".";
import { eventConsumerManager } from "./event-consumer-manager";
import { Tag } from "../tag/tag-registry";
import { eventProducerManager } from "./event-producer-manager";
import { eventConsumerRegistry } from "./event-consumer-registry";
import { useConsoleLog } from "../log/use-console-log";

class EventService {
    public emitSync(eventProducerModel: Model, event: Event) {
        console.log('Event emitSync', eventProducerModel.name, event.constructor.name);
        const eventConsumerTags = eventConsumerManager.query(eventProducerModel, event);
        eventConsumerTags.forEach(eventConsumerTag => {
            const consumerModel = eventConsumerTag.target;
            const key = eventConsumerTag.key;
            const handler = Reflect.get(consumerModel, key);
            if (handler instanceof Function) handler.call(consumerModel, event);
        });
    }

    public async emitAsync(eventProducerModel: Model, event: Event) {
        console.log('Event emitAsync', eventProducerModel.name, event.constructor.name);
        const eventConsumerTags = eventConsumerManager.query(eventProducerModel, event);
        for (const eventConsumerTag of eventConsumerTags) {
            const consumerModel = eventConsumerTag.target;
            const key = eventConsumerTag.key;
            const handler = Reflect.get(consumerModel, key);
            if (handler instanceof Function) await handler.call(consumerModel, event);
        }
    }

    @useConsoleLog()
    public unbind(eventConsumerTag: Tag) {
        const eventTypesMap = eventProducerManager.query(eventConsumerTag);
        eventTypesMap.forEach((eventTypes, eventProducerModel) => {
            eventTypes.forEach(type => {
                console.log('Event unbind:', eventConsumerTag.name);
                eventConsumerManager.remove(eventProducerModel, type, eventConsumerTag);
            })
        })
        eventProducerManager.remove(eventConsumerTag);
    }

    @useConsoleLog()
    public bind(eventConsumerTag: Tag) {
        const consumerModel = eventConsumerTag.target;
        const consumerKey = eventConsumerTag.key;
        const loadersMap = eventConsumerRegistry.query(consumerModel);
        const loaders = loadersMap.get(consumerKey) ?? [];
        loaders.forEach(loader => {
            const [value, type] = loader(consumerModel);
            if (value instanceof Array) {
                const eventProducerModels = value;
                eventProducerModels?.forEach(eventProducerModel => {
                    if (!eventProducerModel) return;
                    console.log('Event bind:', eventConsumerTag.name);
                    eventConsumerManager.add(eventProducerModel, type, eventConsumerTag);
                    eventProducerManager.add(eventConsumerTag, eventProducerModel, type);
                })
            }
            if (value instanceof Model) {
                const eventProducerModel = value;
                console.log('Event bind:', eventConsumerTag.name);
                eventConsumerManager.add(eventProducerModel, type, eventConsumerTag);
                eventProducerManager.add(eventConsumerTag, eventProducerModel, type);
            }
        })
    }
}

export const eventService = new EventService();
