import { Event } from ".";
import { Model } from "../model";
import { useMemo } from "../state/use-memo";
import { runCoroutine } from "../transaction/use-coroutine";
import { Constructor } from "../types";
import { getDescriptor } from "../utils/get-descriptor";
import { addObserver } from "./observer";

export abstract class ChangeEvent<T> extends Event {
    constructor(props: {
        prev: T;
        next: T;
    }) {
        super();
        this.prev = props.prev;
        this.next = props.next;
    }
    public readonly prev: T;
    public readonly next: T;
}


type EventSelectorsMap = Map<string, Array<() => Constructor<Event, [{ prev: any, next: any }]>>>;
type EventConstructorsMap = Map<string, Array<Constructor<Event, [{ prev: any, next: any }]>>>;

export const observerRegistry = new WeakMap<Function, EventSelectorsMap>();

export function useObserver<
    M extends Model & Record<string, any>,
    K extends string
>(selector: () => Constructor<Event, [{ prev: M[K], next: M[K] }]>) {
    return function(
        prototype: M,
        key: K,
        descriptor?: TypedPropertyDescriptor<M[K]>
    ) {
        const constructor = prototype.constructor;
        const selectorsMap: EventSelectorsMap = observerRegistry.get(constructor) ?? new Map();
        const selectors = selectorsMap.get(key) ?? [];
        selectors.push(selector);
        selectorsMap.set(key, selectors);
        observerRegistry.set(constructor, selectorsMap);
        if (descriptor) {
            useMemo()(prototype, key, descriptor);
        } else {  
            const { getter, setter } = getDescriptor(prototype, key);
            Object.defineProperty(prototype, key, {
                get() {
                    return getter.call(this);
                },
                set(this: Model, value) {
                    const prev = Reflect.get(this, key);
                    addObserver(this, key, prev);
                    setter.call(this, value);
                },
                configurable: true,
            });
        }
    }
}

export function getObserverEventTypes(model: Model, key: string) {
    let constructor = model.constructor;
    const result: Constructor<Event, [{ prev: any, next: any }]>[] = [];
    while (constructor) {
        const selectorsMap: EventSelectorsMap = observerRegistry.get(constructor) ?? new Map();
        const selectors = selectorsMap.get(key) ?? [];
        selectors.forEach(selector => {
            const type = selector();
            result.push(type);
        });
        constructor = Object.getPrototypeOf(constructor);
    }
    return result;
}