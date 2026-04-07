import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";
import { getTypes } from "../utils/get-types";
import { Decor } from ".";
import { DecorConfig } from "../state/use-state";

export type DecorProducerConfigMap = Map<string, DecorConfig>
class DecorProducerRegistry {
    private _config: Map<
        AbstractConstructor<Model>,  // DecorProducerModelType
        DecorProducerConfigMap> = new Map();

    public register(
        prototype: Model,
        key: string,
        loader: DecorConfig,
    ) {
        const constructor: any = prototype.constructor;
        const subConfig: DecorProducerConfigMap = this._config.get(constructor) ?? new Map();
        subConfig.set(key, loader)
        this._config.set(constructor, subConfig);
    }

    public query(prototype: Model) {
        const types = getTypes(prototype);
        const result: DecorProducerConfigMap = new Map();
        types.forEach(type => {
            const subConfig: DecorProducerConfigMap = this._config.get(type) ?? new Map();
            subConfig.forEach((loader, key) => result.set(key, loader));
        });
        return result;
    }
}
export const decorProducerRegistry = new DecorProducerRegistry();
