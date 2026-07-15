import { Event } from ".";
import { Model } from "../model";
import { AbstractConstructor, Constructor } from "../types";
import { depCollector } from "../dep/dep-collector";
import { eventManager } from "../dep/dep-consumer-manager";
import { tagRegistry } from "../tag/tag-registry";

export type EventConsumerLoader<
    I extends Model = Model,
    E extends Event = Event
> = (i: I) => [
    target: Array<Model | undefined> | Model | undefined,
    event: Constructor<E>
] | undefined

/**
 * Stores event consumer loaders declared by `useEventConsumer()`.
 */
class EventConsumerRegistry {
    private _loaders: Map<AbstractConstructor<Model>, Map<string, Array<EventConsumerLoader>>> = new Map();

    /**
     * Register an event consumer loader and wrap it with dependency collection.
     *
     * The loader is declared by `useEventConsumer()`. It runs during model
     * initialization and every binding refresh to decide which producer models
     * and event type the method should consume.
     *
     * @param prototype - Prototype that owns the consumer method.
     * @param key - Consumer method key.
     * @param loader - Function that returns target producer(s) and event type.
     * @returns Nothing.
     */
    public register(
        prototype: Model,
        key: string,
        loader: EventConsumerLoader<any>
    ) {
        const ctor: any = prototype.constructor;
        const loaderMap = this._loaders.get(ctor) ?? new Map();
        const loaders = loaderMap.get(key) ?? [];
        const wrapped: EventConsumerLoader = function(self: Model) {
            const consumerTag = tagRegistry.query(self, key);
            depCollector.init(consumerTag);
            const binding = loader(self);
            eventManager.collect(consumerTag);
            return binding;
        };
        loaders.push(wrapped);
        loaderMap.set(key, loaders);
        this._loaders.set(ctor, loaderMap);
    }

    /**
     * Collect inherited event consumer loaders for a model instance.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Map from consumer method key to registered loader list.
     */
    public query(prototype: Model) {
        const loaderMap: Map<string, Array<EventConsumerLoader>> = new Map();
        let ctor: any = prototype.constructor;
        while (ctor) {
            const current: Map<string, Array<EventConsumerLoader>> = this._loaders.get(ctor) ?? new Map();
            current.forEach((loaders, key) => {
                const collected = loaderMap.get(key) ?? [];
                loaders.forEach(loader => {
                    if (collected.includes(loader)) return;
                    collected.push(loader);
                })
                loaderMap.set(key, collected);
            })
            ctor = Object.getPrototypeOf(ctor);
        }
        return loaderMap;
    }
}

export const eventConsumerRegistry = new EventConsumerRegistry();
