import { EventProducerLoader, eventProducerRegistry } from "../event/event-producer-registry";
import { Model } from "../model";

/**
 * Create a property decorator that emits diff events after value changes.
 *
 * The property must also be dependency-backed. During the action flush, the
 * event producer resolver creates the loaded event without a payload.
 *
 * @param loader - Returns the diff event constructor emitted for this property.
 * @returns Property decorator for event producer state.
 */
export function useEventProducer(loader: EventProducerLoader) {
    return function(
        prototype: Model,
        key: string,
    ) {
        eventProducerRegistry.register(prototype, key, loader);
    };
}
