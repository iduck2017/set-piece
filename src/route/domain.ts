import { Model } from "../model";
import { AbstractConstructor } from "../types";
import { findRoute } from "./as-route";

type DomainMap = Map<AbstractConstructor<Model>, Model>;

type DomainSelectorsMap = Map<Function, Array<() => AbstractConstructor<Model>>>;

export const domainRegistry: DomainSelectorsMap = new Map();

export const domainMapHistory: WeakMap<Model, DomainMap> = new WeakMap();

export function registerDomain(prototype: Model, selector: () => AbstractConstructor<Model>) {
    const constructor = prototype.constructor;
    const selectors = domainRegistry.get(constructor) ?? [];
    selectors.push(selector);
    domainRegistry.set(constructor, selectors);
}

export function getDomainMap(model: Model) {
    let constructor = model.constructor;
    const domainMap: DomainMap = new Map();
    while (constructor) {
        const selectors = domainRegistry.get(constructor) ?? [];
        selectors.forEach((selector) => {
            const type = selector()
            const domain = findRoute(model, type);
            if (!domain) return;
            domainMap.set(type, domain);
        })
        constructor = Object.getPrototypeOf(constructor)
    }
    return domainMap;
}


export function updateDomainMap(model: Model) {
    const domainMap = getDomainMap(model);
    domainMapHistory.set(model, domainMap);
}

export function compareDomainMap(model: Model) {
    const prevDomainMap = domainMapHistory.get(model) ?? new Map();
    const nextDomainMap = getDomainMap(model);
    
    const prevDomainKeys = Array.from(prevDomainMap.keys());
    const nextDomainKeys = Array.from(nextDomainMap.keys());
    const domainKeys = [...prevDomainKeys, ...nextDomainKeys];

    for (const key of domainKeys) {
        const prevDomain = prevDomainMap.get(key);
        const nextDomain = nextDomainMap.get(key);
        if (prevDomain !== nextDomain) {
            console.log('Domain changed', model.constructor.name)
            return true
        }
    }
    return false
}