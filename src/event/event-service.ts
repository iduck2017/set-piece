import { Model } from "../model";
import { Event } from ".";
import { eventConsumerManager } from "./event-consumer-manager";
import { Tag } from "../tag/tag-registry";
import { eventProducerManager } from "./event-producer-manager";
import { eventConsumerRegistry } from "./event-consumer-registry";

/**
 * Maintains runtime event listener links and dispatches emitted events.
 */
class EventService {
    /**
     * Emit an event to all currently bound consumers.
     *
     * This looks up consumers by producer model and event constructor, then
     * invokes each matching handler.
     *
     * @param producer - Model that emitted the event.
     * @param event - Event instance delivered to matching consumers.
     * @returns Nothing.
     */
    public emit(producer: Model, event: Event) {
        const consumerTags = eventConsumerManager.query(producer, event);
        consumerTags.forEach(consumerTag => {
            const consumer = consumerTag.target;
            const key = consumerTag.key;
            const handler = Reflect.get(consumer, key);
            if (handler instanceof Function) handler.call(consumer, event);
        });
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
        /** Read reverse links so each old producer/type pair can be removed. */
        const links = eventProducerManager.query(consumerTag);
        links.forEach((types, producer) => {
            types.forEach(type => {
                eventConsumerManager.remove(producer, type, consumerTag);
            })
        })
        /** Drop the reverse index after producer links are cleared. */
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
        /** Find every loader declared on this consumer method. */
        const consumer = consumerTag.target;
        const key = consumerTag.key;
        const loaderMap = eventConsumerRegistry.query(consumer);
        const loaders = loaderMap.get(key) ?? [];
        /** Run loaders and create links for single or list producer targets. */
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
