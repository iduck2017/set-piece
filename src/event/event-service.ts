import { Model } from "../model";
import { Event } from ".";
import { eventConsumerManager } from "./event-consumer-manager";
import { Tag } from "../tag/tag-registry";
import { eventProducerManager } from "./event-producer-manager";
import { eventConsumerRegistry } from "./event-consumer-registry";
class EventService {
    /**
     * Emit an event synchronously to all currently bound consumers.
     *
     * This is the normal event dispatch path. It looks up consumers by producer
     * model and event constructor, then invokes each matching handler.
     *
     * @param eventProducerModel - Model that emitted the event.
     * @param event - Event instance delivered to matching consumers.
     * @returns Nothing.
     */
    public emitSync(eventProducerModel: Model, event: Event) {
        const eventConsumerTags = eventConsumerManager.query(eventProducerModel, event);
        eventConsumerTags.forEach(eventConsumerTag => {
            const consumerModel = eventConsumerTag.target;
            const key = eventConsumerTag.key;
            const handler = Reflect.get(consumerModel, key);
            if (handler instanceof Function) handler.call(consumerModel, event);
        });
    }

    /**
     * Emit an event to consumers sequentially and await each handler.
     *
     * Use this for async event delivery where consumer order should be
     * preserved.
     *
     * @param eventProducerModel - Model that emitted the event.
     * @param event - Event instance delivered to matching consumers.
     * @returns A promise resolved after all matching handlers finish.
     */
    public async emitAsync(eventProducerModel: Model, event: Event) {
        const eventConsumerTags = eventConsumerManager.query(eventProducerModel, event);
        for (const eventConsumerTag of eventConsumerTags) {
            const consumerModel = eventConsumerTag.target;
            const key = eventConsumerTag.key;
            const handler = Reflect.get(consumerModel, key);
            if (handler instanceof Function) await handler.call(consumerModel, event);
        }
    }

    /**
     * Remove all runtime event links owned by one consumer tag.
     *
     * This is used before rebinding a consumer whose loader dependencies
     * changed. It clears both producer-to-consumer and consumer-to-producer
     * indexes.
     *
     * @param eventConsumerTag - Tag pointing to the consumer method to unbind.
     * @returns Nothing.
     */
    public unbind(eventConsumerTag: Tag) {
        const eventTypesMap = eventProducerManager.query(eventConsumerTag);
        eventTypesMap.forEach((eventTypes, eventProducerModel) => {
            eventTypes.forEach(type => {
                eventConsumerManager.remove(eventProducerModel, type, eventConsumerTag);
            })
        })
        eventProducerManager.remove(eventConsumerTag);
    }

    /**
     * Run event consumer loaders and create runtime links.
     *
     * The loader returns a producer model or producer model list plus the event
     * constructor it wants to consume. This method stores those links in both
     * event managers so emit and future unbind operations can find them.
     *
     * @param eventConsumerTag - Tag pointing to the consumer method to bind.
     * @returns Nothing.
     */
    public bind(eventConsumerTag: Tag) {
        const consumerModel = eventConsumerTag.target;
        const consumerKey = eventConsumerTag.key;
        const loadersMap = eventConsumerRegistry.query(consumerModel);
        const loaders = loadersMap.get(consumerKey) ?? [];
        loaders.forEach(loader => {
            const result = loader(consumerModel);
            if (!result) return;
            const [value, EventConstructor] = result;
            if (value instanceof Array) {
                const eventProducerModels = value;
                eventProducerModels?.forEach(eventProducerModel => {
                    if (!eventProducerModel) return;
                    console.log('Event bind:', eventConsumerTag.name);
                    eventConsumerManager.add(eventProducerModel, EventConstructor, eventConsumerTag);
                    eventProducerManager.add(eventConsumerTag, eventProducerModel, EventConstructor);
                })
            }
            if (value instanceof Model) {
                const eventProducerModel = value;
                console.log('Event bind:', eventConsumerTag.name);
                eventConsumerManager.add(eventProducerModel, EventConstructor, eventConsumerTag);
                eventProducerManager.add(eventConsumerTag, eventProducerModel, EventConstructor);
            }
        })
    }
}

export const eventService = new EventService();
