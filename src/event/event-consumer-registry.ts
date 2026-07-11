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

class EventConsumerRegistry {
    private _config: Map<AbstractConstructor<Model>, Map<string, Array<EventConsumerLoader>>> = new Map();

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
        const constructor: any = prototype.constructor;
        const subConfig = this._config.get(constructor) ?? new Map();
        const loaders = subConfig.get(key) ?? [];
        const wrapped: EventConsumerLoader = function(self: Model) {
            const depConsumerTag = tagRegistry.query(self, key);
            depCollector.init(depConsumerTag);
            const result = loader(self);
            eventManager.collect(depConsumerTag);
            return result;
        };
        loaders.push(wrapped);
        subConfig.set(key, loaders);
        this._config.set(constructor, subConfig);
    }

    /**
     * Collect inherited event consumer loaders for a model instance.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Map from consumer method key to registered loader list.
     */
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
