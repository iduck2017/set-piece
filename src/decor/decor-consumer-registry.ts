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
    private _loaders: Map<AbstractConstructor<Model>, DecorConsumerLoadersMap> = new Map();

    /**
     * Register decor loader and handler logic with dependency collection.
     *
     * The loader decides which producer model(s) and decor type a method should
     * consume. The optional descriptor is wrapped so dependencies read inside
     * the handler also participate in future binding refreshes.
     *
     * @param prototype - Prototype that owns the consumer method.
     * @param key - Consumer method key.
     * @param descriptor - Method descriptor for the decor handler.
     * @param loader - Function returning target producer(s) and decor type.
     * @returns Nothing.
     */
    public register<I extends Model, D extends Decor>(
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(decor: D) => void> | undefined,
        loader: DecorConsumerLoader<I, D>,
    ) {
        const ctor: any = prototype.constructor;
        const loaderMap: DecorConsumerLoadersMap = this._loaders.get(ctor) ?? new Map();
        const loaders = loaderMap.get(key) ?? [];
        const wrapped: any = function(model: I) {
            const consumerTag = tagRegistry.query(model, key);
            depCollector.init(consumerTag);
            const binding = loader(model);
            decorManager.collect(consumerTag);
            return binding;
        };
        loaders.push(wrapped);
        loaderMap.set(key, loaders);
        this._loaders.set(ctor, loaderMap);

        if (!descriptor) return;
        const handler = descriptor.value;
        if (!handler) return;
        descriptor.value = function(this: I, decor: D) {
            const consumerTag = tagRegistry.query(this, key);
            depCollector.init(consumerTag);
            const output = handler.call(this, decor);
            decorManager.collect(consumerTag);
            return output;
        }
    }

    /**
     * Collect inherited decor consumer loaders for a model.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Map from consumer method key to registered loader list.
     */
    public query(prototype: Model) {
        const loaderMap: DecorConsumerLoadersMap = new Map();
        let ctor: any = prototype.constructor;
        while (ctor) {
            const current: DecorConsumerLoadersMap = this._loaders.get(ctor) ?? new Map();
            current.forEach((loaders, key) => {
                const collected = loaderMap.get(key) ?? [];
                loaders.forEach(loader => {
                    if (collected.includes(loader)) return;
                    collected.push(loader);
                })
                loaderMap.set(key, collected);
            })
            ctor = Object.getPrototypeOf(ctor);
        }
        return loaderMap;
    }
}
export const decorConsumerRegistry = new DecorConsumerRegistry();
