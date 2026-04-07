import { useDep } from "../dep/use-dep";
import { Model } from "../model";
import { AbstractConstructor, TypedPropertyDecorator } from "../types";
import { routeRegistry } from "./route-registry";

export function useRoute<
    I extends Model & Record<string, any>,
    M extends Model & Record<string, any>,
    K extends string
>(fact: () => AbstractConstructor<M>):
    I[K] extends M | undefined ?
        undefined extends M[K] ?
            TypedPropertyDecorator<I, K> :
            TypedPropertyDecorator<never, never> :
        TypedPropertyDecorator<never, never> {
    return function(
        prototype: I,
        key: K,
    ) {
        useDep()(prototype, key)
        routeRegistry.register(prototype, key, fact);
    }
}
