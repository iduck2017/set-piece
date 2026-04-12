import { Event } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";

export type EventConsumerLoader<
    I extends Model = Model,
    T extends Model = Model,
    E extends Event = Event
> = (i: I) => [
    target: Array<T | undefined> | T | undefined,
    event: Constructor<E>
]

class EventConsumerRegistry {
    private _config: Map<AbstractConstructor<Model>, Map<string, Array<EventConsumerLoader>>> = new Map();

    public register(
        prototype: Model,
        key: string,
        loader: EventConsumerLoader<any>
    ) {
        const constructor: any = prototype.constructor;
        const subConfig = this._config.get(constructor) ?? new Map();
        const loaders = subConfig.get(key) ?? [];
        loaders.push(loader);
        subConfig.set(key, loaders);
        this._config.set(constructor, subConfig);
    }

    public query(prototype: Model) {
        const result: Map<string, Array<EventConsumerLoader>> = new Map();
        let constructor: any = prototype.constructor;
        while (constructor) {
            const subConfig: Map<string, Array<EventConsumerLoader>> = this._config.get(constructor) ?? new Map();
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

export const eventConsumerRegistry = new EventConsumerRegistry();