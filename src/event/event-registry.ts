import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";
import { getTypes } from "../utils/get-types";
import { EventConfig } from "./use-event";

class EventRegistry {
    private _config: Map<AbstractConstructor<Model>, Map<string, Array<EventConfig>>> = new Map();

    public register(
        prototype: Model,
        key: string,
        loader: EventConfig<any>
    ) {
        const constructor: any = prototype.constructor;
        const subConfig = this._config.get(constructor) ?? new Map();
        const loaders = subConfig.get(key) ?? [];
        loaders.push(loader);
        subConfig.set(key, loaders);
        this._config.set(constructor, subConfig);
    }

    public query(prototype: Model) {
        const types = getTypes(prototype);
        const config: Map<string, Array<EventConfig>> = new Map();
        types.forEach(type => {
            const subConfig: Map<string, Array<EventConfig>> = this._config.get(type) ?? new Map();
            subConfig.forEach((subLoaders, key) => {
                const subConfig = config.get(key) ?? [];
                subLoaders.forEach(loader => {
                    if (subConfig.includes(loader)) return;
                    subConfig.push(loader);
                })
                config.set(key, subConfig);
            })
        })
        return config;
    }
}

export const eventRegistry = new EventRegistry();