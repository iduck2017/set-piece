import { Model } from "../model";
import { depCollector } from "../dep/dep-collector";
import { deferEffectRegistry } from "./defer-effect-registry";
import { tagRegistry } from "../tag/tag-registry";
import { deferEffectManager } from "../dep/dep-consumer-manager";

export function useDeferEffect() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>
    ) {
        deferEffectRegistry.register(prototype, key);
        const method = descriptor.value;
        if (!method) return;
        descriptor.value = function(this: Model) {
            const depConsumerTag = tagRegistry.query(this, key);
            // console.log(`DeferEffect run: ${depConsumerTag.name}`);
            depCollector.init(depConsumerTag)
            method.call(this);
            deferEffectManager.collect(depConsumerTag);
        }
    }
}
