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
        const constructor: any = prototype.constructor;
        const subConfig: DecorConsumerLoadersMap = this._config.get(constructor) ?? new Map();
        const loaders = subConfig.get(key) ?? [];
        const _loader: any = function(that: I) {
            const depConsumerTag = tagRegistry.query(that, key);
            depCollector.init(depConsumerTag);
            const result = loader(that);
            decorManager.collect(depConsumerTag);
            return result;
        };
        loaders.push(_loader);
        subConfig.set(key, loaders);
        this._config.set(constructor, subConfig);

        if (!descriptor) return;
        const handler = descriptor.value;
        if (!handler) return;
        descriptor.value = function(this: I, decor: D) {
            const depConsumerTag = tagRegistry.query(this, key);
            depCollector.init(depConsumerTag);
            const result = handler.call(this, decor);
            decorManager.collect(depConsumerTag);
            return result;
        }
    }

    /**
     * Collect inherited decor consumer loaders for a model.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Map from consumer method key to registered loader list.
     */
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
