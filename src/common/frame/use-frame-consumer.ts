import { Frame } from ".";
import { View } from "../../view";
import { depCollector } from "../dep/dep-collector";
import { frameManager } from "../dep/dep-consumer-manager";
import { tagRegistry } from "../tag/tag-registry";
import { FrameConsumerLoader, frameConsumerRegistry } from "./frame-consumer-registry";

export function useFrameConsumer<
    F extends Frame,
    V extends View
>(loader: FrameConsumerLoader<V, F>) {
    return function(
        prototype: V,
        key: string,
        descriptor: TypedPropertyDescriptor<(frame: F) => Promise<void>>,
    ) {
        frameConsumerRegistry.register(prototype, key, function(self: V) {
            const depConsumerTag = tagRegistry.query(self, key);
            depCollector.init(depConsumerTag);
            const result = loader(self);
            frameManager.collect(depConsumerTag);
            return result;
        });
    }
}
