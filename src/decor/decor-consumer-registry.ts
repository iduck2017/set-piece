import { Decor } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";
import { depCollector } from "../dep/dep-collector";
import { decorManager } from "../dep/dep-consumer-manager";
import { tagRegistry } from "../tag/tag-registry";

export type DecorConsumerLoader<
    I extends Model = Model,
    D extends Decor = Decor
> = (i: I) => [
    target: Array<Model | undefined> | Model | undefined,
    decor: Constructor<D>
] | undefined

type DecorConsumerLoadersMap = Map<string, Array<DecorConsumerLoader>>
class DecorConsumerRegistry {
    private _config: Map<AbstractConstructor<Model>, DecorConsumerLoadersMap> = new Map();

    public register(
        prototype: Model,
        key: string,
        loader: DecorConsumerLoader<any>,
        descriptor?: TypedPropertyDescriptor<(decor: any) => void>,
    ) {
        const constructor: any = prototype.constructor;
        const subConfig: DecorConsumerLoadersMap = this._config.get(constructor) ?? new Map();
        const loaders = subConfig.get(key) ?? [];
        const wrapped: DecorConsumerLoader = function(i: Model) {
            const depConsumerTag = tagRegistry.query(i, key);
            depCollector.init(depConsumerTag);
            const result = loader(i);
            decorManager.collect(depConsumerTag);
            return result;
        };
        loaders.push(wrapped);
        subConfig.set(key, loaders);
        this._config.set(constructor, subConfig);

        if (!descriptor) return;
        const handler = descriptor.value;
        if (!handler) return;
        descriptor.value = function(this: Model, decor: Decor) {
            const depConsumerTag = tagRegistry.query(this, key);
            depCollector.init(depConsumerTag);
            const result = handler.call(this, decor);
            decorManager.collect(depConsumerTag);
            return result;
        }
    }

   public query(prototype: Model) {
        const result: DecorConsumerLoadersMap = new Map();
        let constructor: any = prototype.constructor;
        while (constructor) {
            const subConfig: DecorConsumerLoadersMap = this._config.get(constructor) ?? new Map();
            subConfig.forEach((loaders, key) => {
                const subResult = result.get(key) ?? [];
                loaders.forEach(loader => {
                    if (subResult.includes(loader)) return;
                    subResult.push(loader);
                })
                result.set(key, subResult);
            })
            constructor = Object.getPrototypeOf(constructor);
        }
        return result;
    }
}
export const decorConsumerRegistry = new DecorConsumerRegistry();

export function useDecorConsumer<
    D extends Decor,
    I extends Model
>(loader: DecorConsumerLoader<I, D>) {
    return function(
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(decor: D) => void>,
    ) {
        decorConsumerRegistry.register(prototype, key, loader, descriptor);
        return descriptor;
    }
}
