import { Decor } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";
import { tagDelegator } from "../tag/tag-delegator";
import { tagRegistry } from "../tag/tag-registry";
import { decorProducerDelegator } from "./decor-producer-delegator";
import { decorProducerResolver } from "./decor-producer-resolver";
import { decorService } from "./decor-service";

export type DecorProducerLoader<T = any> = () => Constructor<Decor<T>, [origin: T, target: Model]>
export type DecorProducerLoaderMap = Map<string, DecorProducerLoader>

/**
 * Stores and installs decor producer property wrappers.
 */
class DecorProducerRegistry {
    private _loaders: Map<AbstractConstructor<Model>, DecorProducerLoaderMap> = new Map();

    /**
     * Register and wrap a property as a decor producer.
     *
     * Reads create the configured decor from the raw origin value, emit it to
     * bound decor consumers, cache `decor.result`, and return that result.
     * Writes update the raw value and queue this producer for recomputation.
     *
     * @param prototype - Prototype that owns the producer property.
     * @param key - Producer property key.
     * @param loader - Function returning the decor constructor to apply.
     * @returns Nothing.
     */
    public register(
        prototype: Model,
        key: string,
        loader: DecorProducerLoader,
    ) {
        const ctor: any = prototype.constructor;
        const loaders: DecorProducerLoaderMap = this._loaders.get(ctor) ?? new Map();
        loaders.set(key, loader)
        this._loaders.set(ctor, loaders);

        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        const getter = descriptor?.get;
        const setter = descriptor?.set;
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                const tag = tagRegistry.query(this, key)
                let origin;
                if (getter) origin = getter.call(this);
                else origin = tagDelegator.get(this, key);
                if (decorProducerDelegator.check(tag)) {
                    return decorProducerDelegator.query(tag)
                }
                const DecorCtor = loader()
                const decor = new DecorCtor(origin, this);
                decorService.emit(this, decor);
                decorProducerDelegator.update(tag, decor.result);
                return decor.result;
            },
            set(this: Model, value) {
                const tag = tagRegistry.query(this, key)
                if (setter) setter.call(this, value);
                else tagDelegator.set(this, key, value);
                decorProducerResolver.register(tag);
            },
            enumerable: true,
            configurable: true,
        });
    }

    /**
     * Collect inherited decor producer loaders for a model.
     *
     * `DecorProducerResolver.register(model, decorType)` uses this to find
     * producer properties that emit a specific decor type.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Map from producer property key to decor constructor loader.
     */
    public query(prototype: Model) {
        const collected: DecorProducerLoaderMap = new Map();
        let ctor: any = prototype.constructor;
        while (ctor) {
            const loaders: DecorProducerLoaderMap = this._loaders.get(ctor) ?? new Map();
            loaders.forEach((loader, key) => {
                if (collected.has(key)) return;
                collected.set(key, loader);
            })
            ctor = Object.getPrototypeOf(ctor);
        }
        return collected;
    }
}
export const decorProducerRegistry = new DecorProducerRegistry();
