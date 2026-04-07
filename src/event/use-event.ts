import { Event } from ".";
import { depCollector } from "../dep/dep-collector";
import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { Constructor } from "../types";
import { fieldRegistry } from "../utils/field-registry";
import { eventManager } from "./event-manager";
import { eventRegistry } from "./event-registry";

export type EventConfig<
    I extends Model = Model,
    T extends Model = Model,
    E extends Event = Event
> = (i: I) => [
    target: Array<T | undefined> | T | undefined,
    event: Constructor<E>
]

export function useEvent<
    E extends Event,
    I extends Model,
    T extends Model
>(method: EventConfig<I, T, E>) {
    return function(
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(event: E) => void>,
    ) {
        eventRegistry.register(prototype, key, function(self: I) {
            const eventConsumerField = fieldRegistry.query(self, key);
            depCollector.init(eventConsumerField);
            const result = method(self);
            const deps = depCollector.query(eventConsumerField);
            deps.forEach(dep => {
                eventManager.bind(dep, eventConsumerField);
                depManager.bind(eventConsumerField, dep);
            })
            depCollector.clear(eventConsumerField);
            return result;
        });
    }
}