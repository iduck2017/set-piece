import { View } from "../view";
import { AbstractConstructor } from "../types";
import { viewRouteRegistry } from "./view-route-registry";

export function useViewRoute<
    I extends View & Record<string, any>,
    V extends View & I[K],
    K extends string
>(loader: () => AbstractConstructor<V>) {
    return function(
        prototype: I,
        key: K,
    ) {
        viewRouteRegistry.register(prototype, key, loader);
    }
}
