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

class FrameConsumerRegistry {
    private _config: Map<AbstractConstructor<Model>, Map<string, Array<FrameConsumerLoader>>> = new Map();

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
        const constructor: any = prototype.constructor;
        const subConfig = this._config.get(constructor) ?? new Map();
        const loaders = subConfig.get(key) ?? [];
        const wrapped: FrameConsumerLoader = function(self: Model) {
            const depConsumerTag = tagRegistry.query(self, key);
            depCollector.init(depConsumerTag);
            const result = loader(self);
            frameManager.collect(depConsumerTag);
            return result;
        };
        loaders.push(wrapped);
        subConfig.set(key, loaders);
        this._config.set(constructor, subConfig);
    }

    /**
     * Collect inherited frame consumer loaders for a model instance.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Map from consumer method key to registered loader list.
     */
    public query(prototype: Model) {
        const result: Map<string, Array<FrameConsumerLoader>> = new Map();
        let constructor: any = prototype.constructor;
        while (constructor) {
            const subConfig: Map<string, Array<FrameConsumerLoader>> = this._config.get(constructor) ?? new Map();
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

export const frameConsumerRegistry = new FrameConsumerRegistry();
