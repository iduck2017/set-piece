import { Event } from "../event";
import { EventConsumerLoader, eventConsumerRegistry } from "../event/event-consumer-registry";
import { Model } from "../model";

/**
 * Create a method decorator for consuming events from selected producers.
 *
 * The loader receives the consumer model and returns the producer model(s) plus
 * the event type to consume. The decorated method receives matching event
 * instances emitted by those producers.
 *
 * @param loader - Selects producer target(s) and the event constructor.
 * @returns Method decorator for event consumer handlers.
 */
export function useEventConsumer<
    E extends Event,
    I extends Model
>(loader: EventConsumerLoader<I, E>) {
    return function(
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(event: E) => void>,
    ) {
        eventConsumerRegistry.register(prototype, key, loader);
    }
}
