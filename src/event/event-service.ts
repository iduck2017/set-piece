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
     * @param producer - Model that emitted the event.
     * @param event - Event instance delivered to matching consumers.
     * @returns Nothing.
     */
    public emitSync(producer: Model, event: Event) {
        const consumerTags = eventConsumerManager.query(producer, event);
        consumerTags.forEach(consumerTag => {
            const consumer = consumerTag.target;
            const key = consumerTag.key;
            const handler = Reflect.get(consumer, key);
            if (handler instanceof Function) handler.call(consumer, event);
        });
    }

    /**
     * Emit an event to consumers sequentially and await each handler.
     *
     * Use this for async event delivery where consumer order should be
     * preserved.
     *
     * @param producer - Model that emitted the event.
     * @param event - Event instance delivered to matching consumers.
     * @returns A promise resolved after all matching handlers finish.
     */
    public async emitAsync(producer: Model, event: Event) {
        const consumerTags = eventConsumerManager.query(producer, event);
        for (const consumerTag of consumerTags) {
            const consumer = consumerTag.target;
            const key = consumerTag.key;
            const handler = Reflect.get(consumer, key);
            if (handler instanceof Function) await handler.call(consumer, event);
        }
    }

    /**
     * Remove all runtime event links owned by one consumer tag.
     *
     * This is used before rebinding a consumer whose loader dependencies
     * changed. It clears both producer-to-consumer and consumer-to-producer
     * indexes.
     *
     * @param consumerTag - Tag pointing to the consumer method to unbind.
     * @returns Nothing.
     */
    public unbind(consumerTag: Tag) {
        const links = eventProducerManager.query(consumerTag);
        links.forEach((types, producer) => {
            types.forEach(type => {
                eventConsumerManager.remove(producer, type, consumerTag);
            })
        })
        eventProducerManager.remove(consumerTag);
    }

    /**
     * Run event consumer loaders and create runtime links.
     *
     * The loader returns a producer model or producer model list plus the event
     * constructor it wants to consume. This method stores those links in both
     * event managers so emit and future unbind operations can find them.
     *
     * @param consumerTag - Tag pointing to the consumer method to bind.
     * @returns Nothing.
     */
    public bind(consumerTag: Tag) {
        const consumer = consumerTag.target;
        const key = consumerTag.key;
        const loaderMap = eventConsumerRegistry.query(consumer);
        const loaders = loaderMap.get(key) ?? [];
        loaders.forEach(loader => {
            const binding = loader(consumer);
            if (!binding) return;
            const [value, EventCtor] = binding;
            if (value instanceof Array) {
                const producers = value;
                producers?.forEach(producer => {
                    if (!producer) return;
                    console.log('Event bind:', consumerTag.name);
                    eventConsumerManager.add(producer, EventCtor, consumerTag);
                    eventProducerManager.add(consumerTag, producer, EventCtor);
                })
            }
            if (value instanceof Model) {
                const producer = value;
                console.log('Event bind:', consumerTag.name);
                eventConsumerManager.add(producer, EventCtor, consumerTag);
                eventProducerManager.add(consumerTag, producer, EventCtor);
            }
        })
    }
}

export const eventService = new EventService();
