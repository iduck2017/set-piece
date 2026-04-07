import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";
import { getTypes } from "../utils/get-types";
import { Decor } from ".";
import { DecorConsumerConfig } from "./use-decor";

export type DecorConsumerConfigMap = Map<string, Array<DecorConsumerConfig>>
class DecorConsumerRegistry {
    private _config: Map<AbstractConstructor<Model>, DecorConsumerConfigMap> = new Map();

    public register(
        prototype: Model,
        key: string,
        loader: DecorConsumerConfig<any>,
    ) {
        const constructor: any = prototype.constructor;
        const subConfig: DecorConsumerConfigMap = this._config.get(constructor) ?? new Map();
        const loaders = subConfig.get(key) ?? [];
        loaders.push(loader);
        subConfig.set(key, loaders);
        this._config.set(constructor, subConfig);
    }

    public query(prototype: Model) {
        const types = getTypes(prototype);
        const result: DecorConsumerConfigMap = new Map();
        types.forEach(type => {
            const subConfig: DecorConsumerConfigMap = this._config.get(type) ?? new Map();
            subConfig.forEach((subLoaders, key) => {
                const loaders = result.get(key) ?? [];
                subLoaders.forEach(loader => {
                    if (loaders.includes(loader)) return;
                    loaders.push(loader);
                });
                result.set(key, loaders);
            });
        });
        return result;
    }
}
export const decorConsumerRegistry = new DecorConsumerRegistry();
