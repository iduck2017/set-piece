import { depManager } from "../../common/dep/dep-manager";
import { Model } from "..";
import { depCollector } from "../../common/dep/dep-collector";
import { effectRegistry } from "./effect-registry";
import { tagRegistry } from "../../common/tag/tag-registry";
import { effectManager } from "../../common/dep/dep-consumer-manager";

export function useEffect() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>
    ) {
        effectRegistry.register(prototype, key);
        const method = descriptor.value;
        if (!method) return;
        descriptor.value = function(this: Model) {
            const depConsumerTag = tagRegistry.query(this, key);
            // console.log(`Effect run: ${depConsumerTag.name}`);
            depCollector.init(depConsumerTag)
            method.call(this);
            effectManager.collect(depConsumerTag);
        }
    }
}