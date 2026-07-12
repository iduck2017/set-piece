import { Frame } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";
import { depCollector } from "../dep/dep-collector";
import { frameManager } from "../dep/dep-consumer-manager";
import { tagRegistry } from "../tag/tag-registry";

export type FrameConsumerLoader<
    I extends Model = Model,
    F extends Frame = Frame
> = (self: I) => [
    target: Array<Model | undefined> | Model | undefined,
    frame: Constructor<F>
] | undefined

/**
 * Stores frame consumer loaders declared by `useFrameConsumer()`.
 */
class FrameConsumerRegistry {
    private _loaders: Map<AbstractConstructor<Model>, Map<string, Array<FrameConsumerLoader>>> = new Map();

    /**
     * Register a frame consumer loader and wrap it with dependency collection.
     *
     * The loader is declared by `useFrameConsumer()`. It runs during model
     * initialization and every binding refresh to decide which producer models
     * and frame type the method should consume.
     *
     * @param prototype - Prototype that owns the consumer method.
     * @param key - Consumer method key.
     * @param loader - Function that returns target producer(s) and frame type.
     * @returns Nothing.
     */
    public register(
        prototype: Model,
        key: string,
        loader: FrameConsumerLoader<any>
    ) {
        const ctor: any = prototype.constructor;
        const loaderMap = this._loaders.get(ctor) ?? new Map();
        const loaders = loaderMap.get(key) ?? [];
        const wrapped: FrameConsumerLoader = function(self: Model) {
            const consumerTag = tagRegistry.query(self, key);
            depCollector.init(consumerTag);
            const binding = loader(self);
            frameManager.collect(consumerTag);
            return binding;
        };
        loaders.push(wrapped);
        loaderMap.set(key, loaders);
        this._loaders.set(ctor, loaderMap);
    }

    /**
     * Collect inherited frame consumer loaders for a model instance.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Map from consumer method key to registered loader list.
     */
    public query(prototype: Model) {
        const loaderMap: Map<string, Array<FrameConsumerLoader>> = new Map();
        let ctor: any = prototype.constructor;
        while (ctor) {
            const current: Map<string, Array<FrameConsumerLoader>> = this._loaders.get(ctor) ?? new Map();
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

export const frameConsumerRegistry = new FrameConsumerRegistry();
