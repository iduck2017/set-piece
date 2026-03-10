import { Model } from "../model";
import { findRoute } from "../route/use-route";
import { registerDomain } from "../route/domain";
import { AbstractConstructor, Constructor } from "../types";
import { Event } from ".";

type EventSelector<E extends Event = Event, T extends Model = Model> = () => [
    eventType: Constructor<E>, 
    domainType: Constructor<Model>, 
    targetType: AbstractConstructor<T>
];

/** model constructor -> method name -> event selectors */
type EventSelectorsMap = Map<string, Array<EventSelector>>;
type ListenerRegistry = Map<Function, EventSelectorsMap>;

export const listenerRegistry: ListenerRegistry = new Map();

export function useListener<
    I extends Model & Record<string, any>,
    E extends Event,
    T extends Model,
>(selector: EventSelector<E, T>) {
    return function (
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(target: T, event: E) => void>
    ) {
        registerDomain(prototype, () => selector()[1]);
        const constructor = prototype.constructor;
        const selectorsMap: EventSelectorsMap = listenerRegistry.get(constructor) ?? new Map();
        const selectors = selectorsMap.get(key) ?? [];
        selectors.push(selector);
        selectorsMap.set(key, selectors);
        listenerRegistry.set(constructor, selectorsMap);

        const method = descriptor.value;
        if (!method) return descriptor;
        descriptor.value = function _handleEvent(this: I, target: T, event: E) {
            const targetType = selector()[2];
            if (!(target instanceof targetType)) return; 
            method.call(this, target, event);
        }
    }
}

export function getEventSelectorsMap(model: Model): EventSelectorsMap {
    let constructor = model.constructor;
    const result: EventSelectorsMap = new Map();
    while (constructor) {
        const selectorMap: EventSelectorsMap = listenerRegistry.get(constructor) ?? new Map();
        selectorMap.forEach((selectors, key) => {
            selectors.forEach(selector => {
                const selectors = result.get(key) ?? [];
                selectors.push(selector);
                result.set(key, selectors);
            });
        });
        constructor = Object.getPrototypeOf(constructor);
    }
    return result;
}
