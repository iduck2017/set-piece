import { Model } from "../model";
import { Constructor } from "../types";
import { getDescriptor } from "../utils/get-descriptor";

type EventSelectorsMap = Map<string, Array<() => Constructor<Event, [{ prev: any, next: any }]>>>;
type EventSelectorsRegistry = Map<string, Array<Constructor<Event, [{ prev: any, next: any }]>>>;

export const observerRegistry = new Map<Function, EventSelectorsMap>();

export function useObserver<
    M extends Model & Record<string, any>,
    K extends string
>(selector: () => Constructor<Event, [{ prev: M[K], next: M[K] }]>) {
    return function(
        prototype: M,
        key: K,
    ) {
        const constructor = prototype.constructor;
        const selectorsMap: EventSelectorsMap = observerRegistry.get(constructor) ?? new Map();
        const selectors = selectorsMap.get(key) ?? [];
        selectors.push(selector);
        observerRegistry.set(constructor, selectorsMap);

        const { getter, setter } = getDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get() {
                return getter.call(this);
            },
            set(this: Model, value) {
                const prev = Reflect.get(this, key);
                setter.call(this, value);
                const next = Reflect.get(this, key);
                if (prev !== next) {
                    const types = getEventTypes(this, key);
                    types.forEach((eventType) => {
                        const event = new eventType({ prev, next });
                        this._internal.emit(event);
                    });
                }
            }
        });
    }
}

export function getEventTypes(model: Model, key: string) {
    let constructor = model.constructor;
    const result: EventSelectorsRegistry = new Map();
    while (constructor) {
        const selectorsMap: EventSelectorsMap = observerRegistry.get(constructor) ?? new Map();
        selectorsMap.forEach((selectors, key) => {
            selectors.forEach(selector => {
                const types = result.get(key) ?? [];
                types.push(selector());
                result.set(key, types);
            });
        });
        constructor = Object.getPrototypeOf(constructor);
    }
    return result.get(key) ?? [];
}
