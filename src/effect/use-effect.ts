import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { depCollector } from "../dep/dep-collector";
import { effectRegistry } from "./effect-registry";
import { tagRegistry } from "../tag/tag-registry";
import { effectManager } from "../dep/dep-consumer-manager";

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