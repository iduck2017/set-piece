import { FrameProducerLoader, frameProducerRegistry } from "../frame/frame-producer-registry";
import { Model } from "../model";

/**
 * Create a property decorator that emits diff frames after value changes.
 *
 * The property must also be dependency-backed. During the action flush, the
 * frame producer resolver creates the loaded frame without a payload.
 *
 * @param loader - Returns the diff frame constructor emitted for this property.
 * @returns Property decorator for frame producer state.
 */
export function useFrameProducer(loader: FrameProducerLoader) {
    return function(
        prototype: Model,
        key: string,
    ) {
        frameProducerRegistry.register(prototype, key, loader);
    }
}
