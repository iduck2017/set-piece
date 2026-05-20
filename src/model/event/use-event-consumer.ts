import { Event } from ".";
import { depCollector } from "../../common/dep/dep-collector";
import { Model } from "..";
import { Constructor } from "../../types";
import { tagRegistry } from "../../common/tag/tag-registry";
import { EventConsumerLoader, eventConsumerRegistry } from "./event-consumer-registry";
import { eventManager } from "../../common/dep/dep-consumer-manager";

export function useEventConsumer<
    E extends Event,
    I extends Model
>(loader: EventConsumerLoader<I, E>) {
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