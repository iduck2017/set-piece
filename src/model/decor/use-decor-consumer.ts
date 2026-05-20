import { depCollector } from "../../common/dep/dep-collector";
import { depManager } from "../../common/dep/dep-manager";
import { Model } from "..";
import { Constructor } from "../../types";
import { Decor } from ".";
import { DecorConsumerLoader, decorConsumerRegistry } from "./decor-consumer-registry";
import { tagRegistry } from "../../common/tag/tag-registry";
import { decorManager } from "../../common/dep/dep-consumer-manager";

export function useDecorConsumer<
    D extends Decor,
    I extends Model
>(loader: DecorConsumerLoader<I, D>) {
    return function(
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(decor: D) => void>,
    ) {
        decorConsumerRegistry.register(prototype, key, function(i: I) {
            const depConsumerTag = tagRegistry.query(i, key);
            depCollector.init(depConsumerTag);
            const result = loader(i);
            decorManager.collect(depConsumerTag);
            return result;
        });

        const method = descriptor.value;
        if (!method) return;
        descriptor.value = function(this: I, decor: D) {
            const depConsumerTag = tagRegistry.query(this, key);
            depCollector.init(depConsumerTag);
            const result = method.call(this, decor);
            decorManager.collect(depConsumerTag);
            return result;
        }
        return descriptor
    }
}