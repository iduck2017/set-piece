import { DecorProducerLoader, decorProducerRegistry } from "../decor/decor-producer-registry";
import { Model } from "../model";

/**
 * Create a property decorator for values transformed by decor consumers.
 *
 * The loader returns a decor constructor. Reads of the decorated property create
 * that decor from the raw value, let bound consumers modify it, cache the
 * result, and return the decorated result.
 *
 * @param loader - Returns the decor constructor used for this property.
 * @returns Property decorator for decor producer state.
 */
export function useDecorProducer<
    M extends Model & Record<string, any>,
    K extends string,
>(loader: DecorProducerLoader<M[K]>) {
    return function(prototype: M, key: K) {
        decorProducerRegistry.register(prototype, key, loader);
    }
}
