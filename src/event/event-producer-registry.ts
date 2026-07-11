import { DiffEvent } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";

export type EventProducerLoader<T = any> = () => Constructor<DiffEvent<T>, [{ next: T }]>;

class EventProducerRegistry {
    private _config: Map<AbstractConstructor<Model>, Map<string, EventProducerLoader>> = new Map();

    /**
     * Register the event constructor loader for a producer property.
     *
     * `useEventProducer()` calls this during decorator evaluation. Later,
     * `eventProducerResolver` uses it to build diff events after the property
     * changes.
     *
     * @param prototype - Prototype that owns the producer property.
     * @param key - Producer property key.
     * @param loader - Function returning the event constructor to emit.
     * @returns Nothing.
     */
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

    /**
     * Find the nearest inherited event producer loader for a property.
     *
     * @param target - Model instance whose constructor chain is searched.
     * @param key - Producer property key.
     * @returns The registered loader, or undefined when the property is not an
     * event producer.
     */
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
