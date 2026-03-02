import { Model } from "../model";
import { AbstractConstructor, Constructor, TypedPropertyDecorator } from "../types";

type RouteSelectorMap = Map<string, () => AbstractConstructor<Model>>;
type RouteConstructorMap = Map<string, AbstractConstructor<Model>>;
type RouteSelectorRegistry = Map<Function, RouteSelectorMap>;

const routeRegistry: RouteSelectorRegistry = new Map();

export function asRoute<
    M extends Model & Record<string, any>,
    K extends string
>(selector: () => AbstractConstructor<Model>): 
    M[K] extends Model | undefined ? 
        undefined extends M[K] ?
            TypedPropertyDecorator<M, K> :
            TypedPropertyDecorator<never, never> :
        TypedPropertyDecorator<never, never> {
    return function(
        prototype: M,
        key: K,
    ) {
        const constructor = prototype.constructor;
        const selectorMap: RouteSelectorMap = routeRegistry.get(constructor) ?? new Map();
        selectorMap.set(key, selector);
        routeRegistry.set(constructor, selectorMap);
    }
}

export function getRouteTypeMap(model: Model) {
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
export function findRouteMap(model: Model) {
    const typeMap = getRouteTypeMap(model);
    const routeMap: Map<string, Model | undefined> = new Map();
    typeMap.forEach((type: AbstractConstructor<unknown>, key) => {
        let ancestor: Model | undefined = model;
        while (ancestor) {
            if (ancestor instanceof type) {
                routeMap.set(key, ancestor);
                break;
            }
            ancestor = ancestor.parent;
        }
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