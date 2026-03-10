import { Model } from "../model";
import { AbstractConstructor, Constructor, TypedPropertyDecorator } from "../types";

type RouteSelectorMap = Map<string, () => AbstractConstructor<Model>>;
type RouteConstructorMap = Map<string, AbstractConstructor<Model>>;
type RouteRegistry = Map<Function, RouteSelectorMap>;

const routeRegistry: RouteRegistry = new Map();

export function useRoute<
    I extends Model & Record<string, any>,
    M extends Model & Record<string, any>,
    K extends string
>(selector: () => AbstractConstructor<M>): 
    I[K] extends M | undefined ? 
        undefined extends M[K] ?
            TypedPropertyDecorator<I, K> :
            TypedPropertyDecorator<never, never> :
        TypedPropertyDecorator<never, never> {
    return function(
        prototype: I,
        key: K,
    ) {
        const constructor = prototype.constructor;
        const selectorMap: RouteSelectorMap = routeRegistry.get(constructor) ?? new Map();
        selectorMap.set(key, selector);
        routeRegistry.set(constructor, selectorMap);
    }
}

function getRouteTypeMap(model: Model) {
    let constructor = model.constructor;
    const result: RouteConstructorMap = new Map();
    while (constructor) {
        const selectorMap: RouteSelectorMap = routeRegistry.get(constructor) ?? new Map();
        selectorMap.forEach((selector, key) => {
            result.set(key, selector());
        });
        constructor = Object.getPrototypeOf(constructor) as Function;
    }
    return result;
}


export function findRoute(model: Model, type: AbstractConstructor<Model>) {
    let ancestor: Model | undefined = model;
    while (ancestor) {
        const _ancester = ancestor;
        if (_ancester instanceof type) return ancestor;
        ancestor = ancestor.parent;
    }
}

export function getRouteMap(model: Model) {
    const typeMap = getRouteTypeMap(model);
    const routeMap: Map<string, Model | undefined> = new Map();
    typeMap.forEach((type, key) => {
        const ancestor = findRoute(model, type);
        routeMap.set(key, ancestor);
    })
    return routeMap;
}



export function findRoot(model: Model) {
    let ancestor: Model | undefined = model;
    while (ancestor.parent) {
        ancestor = ancestor.parent;
    }
    return ancestor;
}