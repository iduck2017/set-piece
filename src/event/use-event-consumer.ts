import { Event } from ".";
import { depCollector } from "../dep/dep-collector";
import { Model } from "../model";
import { Constructor } from "../types";
import { tagRegistry } from "../tag/tag-registry";
import { EventConsumerLoader, eventConsumerRegistry } from "./event-consumer-registry";
import { eventManager } from "../dep/dep-consumer-manager";

export function useEventConsumer<
    E extends Event,
    I extends Model,
    T extends Model
>(loader: EventConsumerLoader<I, T, E>) {
    return function(
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(event: E) => void>,
    ) {
        eventConsumerRegistry.register(prototype, key, function(self: I) {
            const depConsumerTag = tagRegistry.query(self, key);
            depCollector.init(depConsumerTag);
            const result = loader(self);
            eventManager.collect(depConsumerTag);
            return result;
        });
    }
}