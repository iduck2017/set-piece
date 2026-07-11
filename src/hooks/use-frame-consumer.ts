import { Frame } from "../frame";
import { FrameConsumerLoader, frameConsumerRegistry } from "../frame/frame-consumer-registry";
import { Model } from "../model";

/**
 * Create a method decorator for consuming frames from selected producers.
 *
 * The loader receives the consumer model and returns the producer model(s) plus
 * the frame type to consume. The decorated async method is called by
 * `FrameResolver` when matching frames are flushed.
 *
 * @param loader - Selects producer target(s) and the frame constructor.
 * @returns Method decorator for frame consumer handlers.
 */
export function useFrameConsumer<
    F extends Frame,
    I extends Model
>(loader: FrameConsumerLoader<I, F>) {
    return function(
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(frame: F) => Promise<void>>,
    ) {
        frameConsumerRegistry.register(prototype, key, loader);
    }
}
