import { useDep } from "../dep/use-dep";
import { Model } from "../model";
import { AbstractConstructor, TypedPropertyDecorator } from "../types";
import { routeRegistry } from "./route-registry";

export function useRoute<
    I extends Model & Record<string, any>,
    M extends Model & I[K],
    K extends string
>(loader: () => AbstractConstructor<M>) {
    return function(
        prototype: I,
        key: K,
    ) {
        useDep()(prototype, key)
        routeRegistry.register(prototype, key, loader);
    }
}
