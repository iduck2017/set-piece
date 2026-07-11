import { ChangeEvent } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";

export type EventProducerLoader<T = any> = () => Constructor<ChangeEvent<T>, [{ next: T }]>;

class EventProducerRegistry {
    private _config: Map<AbstractConstructor<Model>, Map<string, EventProducerLoader>> = new Map();

    public register(
        prototype: Model,
        key: string,
        loader: EventProducerLoader,
    ) {
        const constructor: any = prototype.constructor;
        const subConfig = this._config.get(constructor) ?? new Map<string, EventProducerLoader>();
        subConfig.set(key, loader);
        this._config.set(constructor, subConfig);
    }

    public query(target: Model, key: string): EventProducerLoader | undefined {
        let constructor: any = target.constructor;
        while (constructor) {
            const subConfig = this._config.get(constructor);
            const loader = subConfig?.get(key);
            if (loader) return loader;
            constructor = Object.getPrototypeOf(constructor);
        }
        return undefined;
    }
}

export const eventProducerRegistry = new EventProducerRegistry();

