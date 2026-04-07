import { depCollector } from "../dep/dep-collector";
import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { Constructor } from "../types";
import { fieldRegistry } from "../utils/field-registry";
import { Decor } from ".";
import { decorManager } from "./decor-manager";
import { decorConsumerRegistry } from "./decor-consumer-registry";

export type DecorConsumerConfig<
    I extends Model = Model,
    T extends Model = Model,
    D extends Decor = Decor
> = (i: I) => [
    target: Array<T | undefined> | T | undefined,
    event: Constructor<D>
]

export function useDecor<
    D extends Decor,
    I extends Model,
    T extends Model
>(loader: DecorConsumerConfig<I, T, D>) {
    return function(
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(decor: Decor) => void>,
    ) {
        decorConsumerRegistry.register(prototype, key, function(self: I) {
            const decorConsumerField = fieldRegistry.query(self, key);
            depCollector.init(decorConsumerField);
            const result = loader(self);
            const deps = depCollector.query(decorConsumerField);
            deps.forEach(dep => {
                decorManager.bind(dep, decorConsumerField);
                depManager.bind(decorConsumerField, dep);
            })
            depCollector.clear(decorConsumerField);
            return result;
        });

        const method = descriptor.value;
        if (!method) return; 
        descriptor.value = function(this: I, decor: Decor) {
            const decorConsumerField = fieldRegistry.query(this, key);
            depCollector.init(decorConsumerField);
            const result = method.call(this, decor); 
            const deps = depCollector.query(decorConsumerField);
            deps.forEach(dep => {
                decorManager.bind(dep, decorConsumerField);
                depManager.bind(decorConsumerField, dep);
            })
            depCollector.clear(decorConsumerField);
            return result;
        }
        return descriptor
    }
}