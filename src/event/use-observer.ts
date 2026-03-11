import { Event } from ".";
import { Model } from "../model";
import { useMemo } from "../state/use-memo";
import { appendCoroutine } from "../transaction/use-coroutine";
import { Constructor } from "../types";
import { getDescriptor } from "../utils/get-descriptor";

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
        if (!descriptor) {
            const { getter, setter } = getDescriptor(prototype, key);
            Object.defineProperty(prototype, key, {
                get() {
                    return getter.call(this);
                },
                set(this: Model, value) {
                    const prev = Reflect.get(this, key);
                    setter.call(this, value);
                    appendCoroutine(() => {
                        const next = Reflect.get(this, key);
                        if (prev !== next) {
                            const types = selector()
                            const event = new types({ prev, next });
                            this._internal.emit(event, {
                                isYield: true
                            });
                        }
                    })
                },
                configurable: true,
            });
        } else {
            useMemo()(prototype, key, descriptor);
            const constructor = prototype.constructor;
            const selectorsMap: EventSelectorsMap = observerRegistry.get(constructor) ?? new Map();
            const selectors = selectorsMap.get(key) ?? [];
            selectors.push(selector);
            selectorsMap.set(key, selectors);
            observerRegistry.set(constructor, selectorsMap);
        }
    }
}

export function getChangeEventTypes(model: Model, key: string) {
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