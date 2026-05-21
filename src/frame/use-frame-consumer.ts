import { Frame } from ".";
import { Model } from "../model";
import { depCollector } from "../dep/dep-collector";
import { frameManager } from "../dep/dep-consumer-manager";
import { tagRegistry } from "../tag/tag-registry";
import { FrameConsumerLoader, frameConsumerRegistry } from "./frame-consumer-registry";

export function useFrameConsumer<
    F extends Frame,
    I extends Model
>(loader: FrameConsumerLoader<I, F>) {
    return function(
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(frame: F) => Promise<void>>,
    ) {
        frameConsumerRegistry.register(prototype, key, function(self: I) {
            const depConsumerTag = tagRegistry.query(self, key);
            depCollector.init(depConsumerTag);
            const result = loader(self);
            frameManager.collect(depConsumerTag);
            return result;
        });
    }
}
