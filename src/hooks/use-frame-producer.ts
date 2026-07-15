import { FrameProducerLoader, frameProducerRegistry } from "../frame/frame-producer-registry";
import { Model } from "../model";

/**
 * Create a property decorator that emits diff frames after value changes.
 *
 * The property must also be dependency-backed. During the anime flush, the
 * frame producer resolver creates the loaded frame with `{ next }`.
 *
 * @param loader - Returns the diff frame constructor emitted for this property.
 * @returns Property decorator for frame producer state.
 */
export function useFrameProducer<
    M extends Model & Record<string, any>,
    K extends string,
>(loader: FrameProducerLoader<M[K]>) {
    return function(
        prototype: M,
        key: K,
    ) {
        frameProducerRegistry.register(prototype, key, loader);
    }
}
