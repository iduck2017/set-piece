import { Model } from "../model";
import { Constructor } from "../types";
import { runValidators, validatorRegistry } from "../utils/use-self-validator";
import { Event } from "./event";
import { getEventTypesMap } from "./on-emit";

/** event constructor -> model instance -> method names */
export type HandlerKeysMap = Map<Model, string[]>;
export type HandlerKeysRegistry = Map<Function, HandlerKeysMap>;

export const listenerRegistry: WeakMap<Model, HandlerKeysRegistry> = new WeakMap();

export function addListeners(model: Model) {
    const typesMap = getEventTypesMap(model);
    const root = model.root;
    const handlerRegistry = listenerRegistry.get(root) ?? new Map();
    typesMap.forEach((types, key) => {
        const flag = runValidators(model, key);
        if (!flag) return;
        types.forEach(type => {
            const handlerKeysMap: HandlerKeysMap = handlerRegistry.get(type) ?? new Map();
            const handlerKeys = handlerKeysMap.get(model) ?? [];
            handlerKeys.push(key);
            handlerKeysMap.set(model, handlerKeys);
            handlerRegistry.set(type, handlerKeysMap);
        })
    })
    listenerRegistry.set(root, handlerRegistry);
}

export function removeListeners(model: Model) {
    const root = model.root;
    const handlerRegistry = listenerRegistry.get(root);
    if (!handlerRegistry) return;
    handlerRegistry.forEach((handlerKeysMap) => {
        handlerKeysMap.delete(model);
    })
}

export function transferListeners(model: Model, prevRoot?: Model) {
    if (!prevRoot) return;
    const nextRoot = model.root;
    console.log("Transfer listeners from", prevRoot.constructor.name, "to", nextRoot.constructor.name);
    const prevHandlerRegistry = listenerRegistry.get(prevRoot);
    if (!prevHandlerRegistry) return;
    const nextHandlerRegistry: HandlerKeysRegistry = 
        listenerRegistry.get(nextRoot) ?? new Map();
    prevHandlerRegistry.forEach((prevHandlerKeysMap, eventType) => {
        const handlerKeys = prevHandlerKeysMap.get(model);
        const nextHandlerKeysMap = nextHandlerRegistry.get(eventType) ?? new Map();
        nextHandlerKeysMap.set(model, handlerKeys);
        prevHandlerKeysMap.delete(model);
        nextHandlerRegistry.set(eventType, nextHandlerKeysMap);
    })
    listenerRegistry.set(nextRoot, nextHandlerRegistry);
}

export function getHandlers(model: Model, event: Event) {
    const root = model.root;
    const handlerRegistry = listenerRegistry.get(root);
    const handlerKeysMap = handlerRegistry?.get(event.constructor);
    if (!handlerKeysMap) return [];

    const handlers: Array<(target: Model, event: Event) => void> = [];
    handlerKeysMap.forEach((keys, model) => {
        keys.forEach(key => {
            const method = Reflect.get(model, key);
            if (method instanceof Function) {
                handlers.push(method.bind(model));
            }
        });
    })
    return handlers;
}