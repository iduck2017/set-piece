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

class DecorProducerRegistry {
    private _config: Map<AbstractConstructor<Model>, DecorProducerLoaderMap> = new Map();

    public register(
        prototype: Model,
        key: string,
        loader: DecorProducerLoader,
    ) {
        const constructor: any = prototype.constructor;
        const subConfig: DecorProducerLoaderMap = this._config.get(constructor) ?? new Map();
        subConfig.set(key, loader)
        this._config.set(constructor, subConfig);

        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        const getter = descriptor?.get;
        const setter = descriptor?.set;
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                const depConsumerTag = tagRegistry.query(this, key)
                let origin;
                if (getter) origin = getter.call(this);
                else origin = tagDelegator.get(this, key);
                if (decorProducerDelegator.check(depConsumerTag)) {
                    return decorProducerDelegator.query(depConsumerTag)
                }
                const decorConstructors = loader()
                const decor = new decorConstructors(origin, this);
                decorService.emit(this, decor);
                decorProducerDelegator.update(depConsumerTag, decor.result);
                return decor.result;
            },
            set(this: Model, value) {
                const decorProducerTag = tagRegistry.query(this, key)
                if (setter) setter.call(this, value);
                else tagDelegator.set(this, key, value);
                decorProducerResolver.register(decorProducerTag);
            },
            enumerable: true,
            configurable: true,
        });
    }

    public query(prototype: Model) {
        const result: DecorProducerLoaderMap = new Map();
        let constructor: any = prototype.constructor;
        while (constructor) {
            const loaders: DecorProducerLoaderMap = this._config.get(constructor) ?? new Map();
            loaders.forEach((loader, key) => {
                if (result.has(key)) return;
                result.set(key, loader);
            })
            constructor = Object.getPrototypeOf(constructor);
        }
        return result;
    }
}
export const decorProducerRegistry = new DecorProducerRegistry();

export function useDecorProducer<
    M extends Model & Record<string, any>,
    K extends string,
>(loader: DecorProducerLoader<M[K]>) {
    return function(prototype: M, key: K) {
        decorProducerRegistry.register(prototype, key, loader);
    }
}

