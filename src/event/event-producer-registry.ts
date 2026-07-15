import { DiffEvent } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";

export type EventProducerLoader<T = any> = () => Constructor<DiffEvent<T>, [{ next: T }]>;

/**
 * Stores event producer loaders declared by `useEventProducer()`.
 */
class EventProducerRegistry {
    private _loaders: Map<AbstractConstructor<Model>, Map<string, EventProducerLoader>> = new Map();

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
        const ctor: any = prototype.constructor;
        const loaders = this._loaders.get(ctor) ?? new Map<string, EventProducerLoader>();
        loaders.set(key, loader);
        this._loaders.set(ctor, loaders);
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
        let ctor: any = target.constructor;
        while (ctor) {
            const loaders = this._loaders.get(ctor);
            const loader = loaders?.get(key);
            if (loader) return loader;
            ctor = Object.getPrototypeOf(ctor);
        }
        return undefined;
    }
}

export const eventProducerRegistry = new EventProducerRegistry();
