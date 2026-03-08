import { Model } from "../model";
import { findRoute } from "../route/as-route";
import { getDomainMap } from "../route/domain";
import { AbstractConstructor, Constructor } from "../types";
import { runValidators, validatorRegistry } from "../utils/use-self-validator";
import { Event } from "./event";
import { getEventSelectorsMap } from "./on-emit";

/** event constructor -> model instance -> method names */
export type HandlerKeysMap = Map<Model, string[]>;

export type HandlerKeysRegistry = Map<Function, HandlerKeysMap>;

/** domain -> handler keys */
export const eventListenerRegistry: WeakMap<Model, HandlerKeysRegistry> = new WeakMap();

export function addEventListeners(model: Model) {
    const selectorsMap = getEventSelectorsMap(model);
    selectorsMap.forEach((selectors, key) => {
        const flag = runValidators(model, key);
        if (!flag) return;
        selectors.forEach(selector => {
            const [eventType, domainType] = selector();
            const domain = findRoute(model, domainType);
            if (!domain) return;

            const handlerRegistry = eventListenerRegistry.get(domain) ?? new Map();
            const handlerKeysMap: HandlerKeysMap = handlerRegistry.get(eventType) ?? new Map();
            const handlerKeys = handlerKeysMap.get(model) ?? [];
            handlerKeys.push(key);
            handlerKeysMap.set(model, handlerKeys);
            handlerRegistry.set(eventType, handlerKeysMap);
            eventListenerRegistry.set(domain, handlerRegistry);
        })
    })
}

export function removeEventListeners(model: Model) {
    // const root = model.root;
    // const handlerRegistry = listenerRegistry.get(root);
    // if (!handlerRegistry) return;
    // handlerRegistry.forEach((handlerKeysMap) => {
    //     handlerKeysMap.delete(model);
    // })
    const domainMap = getDomainMap(model);
    domainMap.forEach((domain, key) => {
        if (!domain) return;
        const handlerRegistry: HandlerKeysRegistry = eventListenerRegistry.get(domain) ?? new Map();
        handlerRegistry.forEach((handlerKeysMap) => {
            handlerKeysMap.delete(model);
        })
    })
}

// export function transferListeners(model: Model, prevRoot?: Model) {
//     if (!prevRoot) return;
//     const nextRoot = model.root;
//     // console.log("Transfer listeners from", prevRoot.constructor.name, "to", nextRoot.constructor.name);
//     const prevHandlerRegistry = listenerRegistry.get(prevRoot);
//     if (!prevHandlerRegistry) return;
//     const nextHandlerRegistry: HandlerKeysRegistry = 
//         listenerRegistry.get(nextRoot) ?? new Map();
//     prevHandlerRegistry.forEach((prevHandlerKeysMap, eventType) => {
//         const handlerKeys = prevHandlerKeysMap.get(model);
//         const nextHandlerKeysMap = nextHandlerRegistry.get(eventType) ?? new Map();
//         nextHandlerKeysMap.set(model, handlerKeys);
//         prevHandlerKeysMap.delete(model);
//         nextHandlerRegistry.set(eventType, nextHandlerKeysMap);
//     })
//     listenerRegistry.set(nextRoot, nextHandlerRegistry);
// }
