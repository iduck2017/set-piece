import { Decor } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";

export type DecorProducerLoader<T = any> = () => Constructor<Decor<T>, [origin: T]>
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
