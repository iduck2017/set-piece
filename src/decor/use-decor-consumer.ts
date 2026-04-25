import { depCollector } from "../dep/dep-collector";
import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { Constructor } from "../types";
import { Decor } from ".";
import { DecorConsumerLoader, decorConsumerRegistry } from "./decor-consumer-registry";
import { tagRegistry } from "../tag/tag-registry";
import { decorManager } from "../dep/dep-consumer-manager";

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