import { Model } from "../model";
import { findRoute } from "../route/as-route";
import { getDomainMap } from "../route/domain";
import { AbstractConstructor, Constructor } from "../types";
import { runValidators, validatorRegistry } from "../utils/use-self-validator";
import { getDecorSelectorsMap } from "./on-calc";
import { Decor } from "./decor";

/** event constructor -> model instance -> method names */
export type HandlerKeysMap = Map<Model, string[]>;

export type HandlerKeysRegistry = Map<Function, HandlerKeysMap>;

/** domain -> handler keys */
export const decorListenerRegistry: WeakMap<Model, HandlerKeysRegistry> = new WeakMap();

export function addDecorListeners(model: Model) {
    const selectorsMap = getDecorSelectorsMap(model);
    selectorsMap.forEach((selectors, key) => {
        const flag = runValidators(model, key);
        if (!flag) return;
        selectors.forEach(selector => {
            const [eventType, domainType] = selector();
            const domain = findRoute(model, domainType);
            if (!domain) return;

            const handlerRegistry = decorListenerRegistry.get(domain) ?? new Map();
            const handlerKeysMap: HandlerKeysMap = handlerRegistry.get(eventType) ?? new Map();
            const handlerKeys = handlerKeysMap.get(model) ?? [];
            handlerKeys.push(key);
            handlerKeysMap.set(model, handlerKeys);
            handlerRegistry.set(eventType, handlerKeysMap);
            decorListenerRegistry.set(domain, handlerRegistry);
        })
    })
}

export function removeDecorListeners(model: Model) {
    const domainMap = getDomainMap(model);
    domainMap.forEach((domain, key) => {
        if (!domain) return;
        const handlerRegistry: HandlerKeysRegistry = decorListenerRegistry.get(domain) ?? new Map();
        handlerRegistry.forEach((handlerKeysMap) => {
            handlerKeysMap.delete(model);
        })
    })
}

export function getDecorHandlers(model: Model, decor: Decor) {
    let ancestor: Model | undefined = model;
    const result: Array<(target: Model, decor: Decor) => void> = [];
    while (ancestor) {
        const handlerRegistry = decorListenerRegistry.get(ancestor);
        const handlerKeysMap = handlerRegistry?.get(decor.constructor);
        handlerKeysMap?.forEach((keys, model) => {
            keys.forEach(key => {
                const method = Reflect.get(model, key);
                if (method instanceof Function) {
                    result.push(method.bind(model));
                }
            });
        })
        ancestor = ancestor.parent;
    }
    // console.log('Get handlers', result)
    return result;
}