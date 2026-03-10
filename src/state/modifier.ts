import { Model } from "../model";
import { findRoute } from "../route/use-route";
import { getDomainMap } from "../route/domain";
import { AbstractConstructor, Constructor } from "../types";
import { runValidators, validatorRegistry } from "../utils/use-self-validator";
import { getDecorSelectorsMap } from "./use-modifier";
import { Decor } from "./decor";
import { HandlerKeysMap, HandlerRegistry } from "../event/listener";

/** domain -> handler keys */
export const modifierContext: WeakMap<Model, HandlerRegistry> = new WeakMap();

export function addDecorListeners(model: Model) {
    const selectorsMap = getDecorSelectorsMap(model);
    selectorsMap.forEach((selectors, key) => {
        const flag = runValidators(model, key);
        if (!flag) return;
        selectors.forEach(selector => {
            const [decorType, domainType] = selector();
            const domain = findRoute(model, domainType);
            if (!domain) return;

            const handlerRegistry: HandlerRegistry = modifierContext.get(domain) ?? new Map();
            const handlerKeysMap: HandlerKeysMap = handlerRegistry.get(decorType) ?? new Map();
            const handlerKeys = handlerKeysMap.get(model) ?? [];
            handlerKeys.push(key);
            handlerKeysMap.set(model, handlerKeys);
            handlerRegistry.set(decorType, handlerKeysMap);
            modifierContext.set(domain, handlerRegistry);
        })
    })
}

export function removeDecorListeners(model: Model) {
    const domainMap = getDomainMap(model);
    domainMap.forEach((domain, key) => {
        if (!domain) return;
        const handlerRegistry: HandlerRegistry = modifierContext.get(domain) ?? new Map();
        handlerRegistry.forEach((handlerKeysMap) => {
            handlerKeysMap.delete(model);
        })
    })
}

export function getDecorHandlers(model: Model, decor: Decor) {
    let ancestor: Model | undefined = model;
    const result: Array<(target: Model, decor: Decor) => void> = [];
    while (ancestor) {
        const handlerRegistry = modifierContext.get(ancestor);
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

