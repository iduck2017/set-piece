import { routeRegistry } from "../route/route-registry";
import { Model } from "../model";
import { AbstractConstructor } from "../types";

/**
 * Create a property decorator for nearest-ancestor route lookup.
 *
 * The loader returns the model constructor to search for. During reroute, the
 * decorated property is set to the nearest ancestor matching that constructor.
 *
 * @param loader - Returns the route target constructor.
 * @returns Property decorator for route fields.
 */
export function useRoute<
    I extends Model & Record<string, any>,
    M extends Model & I[K],
    K extends string
>(loader: () => AbstractConstructor<M>) {
    return function(prototype: I, key: K) {
        routeRegistry.register(prototype, key, loader);
    }
}
