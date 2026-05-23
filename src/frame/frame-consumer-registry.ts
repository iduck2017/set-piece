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

export function useFrameConsumer<
    F extends Frame,
    I extends Model
>(loader: FrameConsumerLoader<I, F>) {
    return function(
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(frame: F) => Promise<void>>,
    ) {
        frameConsumerRegistry.register(prototype, key, loader);
    }
}
