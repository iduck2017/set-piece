import { effectRegistry } from "../effect/effect-registry";
import { Model } from "../model";

/**
 * Create a method decorator for action-scoped reactive effects.
 *
 * The method runs during model initialization and whenever one of the
 * dependencies it read previously changes during an action flush.
 *
 * @returns Method decorator for reactive effect methods.
 */
export function useEffect() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ) {
        effectRegistry.register(prototype, key, descriptor);
    }
}
