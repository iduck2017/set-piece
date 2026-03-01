import { Model } from "../model";
import { Constructor } from "../types";
import { Event } from "./event";

/** model constructor -> method name -> event selectors */
type EventSelectorsMap = Map<string, Array<() => Constructor<Event>>>;
type EventSelectorsRegistry = Map<Function, EventSelectorsMap>;

/** method name -> event constructors */
type EventTypeMap = Map<string, Array<Constructor<Event>>>;

export const eventRegistry: EventSelectorsRegistry = new Map();

export function onEmit<
    I extends Model & Record<string, any>,
    E extends Event
>(selector: () => Constructor<E>) {
    return function (
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(target: Model, event: E) => void>
    ) {
        const constructor = prototype.constructor;
        const selectorsMap: EventSelectorsMap = eventRegistry.get(constructor) ?? new Map();
        const selectors = selectorsMap.get(key) ?? [];
        selectors.push(selector);
        selectorsMap.set(key, selectors);
        eventRegistry.set(constructor, selectorsMap);
    }
}

export function getEventTypesMap(model: Model) {
    let constructor = model.constructor;
    const result: EventTypeMap = new Map();
    while (constructor) {
        const selectorMap: EventSelectorsMap = eventRegistry.get(constructor) ?? new Map();
        selectorMap.forEach((selectors, key) => {
            selectors.forEach(selector => {
                const type = result.get(key) ?? [];
                type.push(selector());
                result.set(key, type);
            });
        });
        constructor = Object.getPrototypeOf(constructor);
    }
    return result;
}
