import { Model } from "../model";
import { runTrx } from "../transaction/use-trx";
import { getObserverEventTypes } from "./use-observer";

export const observerContext: Map<Model, Map<string, any>> = new Map();

export function addObserver(model: Model, key: string, prev: any) {
    runTrx(() => {
        const observer = observerContext.get(model) ?? new Map();
        observer.set(key, prev);
        observerContext.set(model, observer);
        console.log('Add observer', model.name, observerContext.get(model));
    })
}

export function runObservers() {
    observerContext.forEach((observers, model) => {
        observers.forEach((prev, key) => {
            const next = Reflect.get(model, key);
            console.log('Diff memory', key, prev, next);
            if (prev !== next) {
                const types = getObserverEventTypes(model, key);
                types.forEach(type => {
                    const event = new type({ prev, next });
                    model._internal.emit(event, {
                        isYield: true
                    });
                })
            }
        })
    })
    observerContext.clear()
}
