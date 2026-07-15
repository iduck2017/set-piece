import { Model } from "../model";
import { Decor } from ".";
import { decorConsumerManager } from "./decor-consumer-manager";
import { decorConsumerRegistry } from "./decor-consumer-registry";
import { decorProducerManager } from "./decor-producer-manager";
import { Tag } from "../tag/tag-registry";
import { decorProducerResolver } from "./decor-producer-resolver";

/**
 * Maintains runtime decor links and applies decor consumers.
 */
class DecorService {
    /**
     * Apply a decor instance to all currently bound consumers.
     *
     * This is called while a decor producer property is being read. Consumers
     * can mutate the decor object before the producer caches and returns
     * `decor.result`.
     *
     * @param producer - Model whose producer property created decor.
     * @param decor - Decor instance passed to matching consumer handlers.
     * @returns Nothing.
     */
    public emit(producer: Model, decor: Decor) {
        const consumerTags = decorConsumerManager.query(producer, decor);
        consumerTags.forEach(consumerTag => {
            const consumer = consumerTag.target;
            const key = consumerTag.key;
            const handler = Reflect.get(consumer, key);
            if (handler instanceof Function) {
                handler.call(consumer, decor);
            }
        });
    }

    /**
     * Remove all runtime decor links owned by one consumer tag.
     *
     * This is used before rebinding a consumer whose loader dependencies
     * changed. Removed links also queue affected producers so their cached
     * decorated values can be recomputed.
     *
     * @param consumerTag - Tag pointing to the consumer method to unbind.
     * @returns Nothing.
     */
    public unbind(consumerTag: Tag) {
        /** Read reverse links so each old producer/type pair can be removed. */
        const links = decorProducerManager.query(consumerTag);
        links.forEach((types, producer) => {
            types.forEach(type => {
                decorConsumerManager.remove(producer, type, consumerTag);
                decorProducerResolver.register(producer, type);
            })
        })
        /** Drop the reverse index after affected producers have been queued. */
        decorProducerManager.remove(consumerTag);
    }

    /**
     * Run decor consumer loaders and create runtime links.
     *
     * The loader returns a producer model or producer model list plus the decor
     * constructor it wants to consume. This method stores those links in both
     * decor managers and queues the producer for recomputation.
     *
     * @param consumerTag - Tag pointing to the consumer method to bind.
     * @returns Nothing.
     */
    public bind(consumerTag: Tag) {
        /** Find every loader declared on this consumer method. */
        const consumer = consumerTag.target;
        const key = consumerTag.key;
        const loaderMap = decorConsumerRegistry.query(consumer);
        const loaders = loaderMap.get(key) ?? [];
        /** Run loaders and create links for single or list producer targets. */
        loaders.forEach(loader => {
            const binding = loader(consumer);
            if (!binding) return;
            const [value, DecorCtor] = binding;
            if (value instanceof Array) {
                const producers = value;
                producers?.forEach(producer => {
                    if (!producer) return;
                    decorConsumerManager.add(producer, DecorCtor, consumerTag);
                    decorProducerManager.add(consumerTag, producer, DecorCtor);
                    decorProducerResolver.register(producer, DecorCtor);
                })
            }
            if (value instanceof Model) {
                const producer = value;
                decorConsumerManager.add(producer, DecorCtor, consumerTag);
                decorProducerManager.add(consumerTag, producer, DecorCtor);
                decorProducerResolver.register(producer, DecorCtor);
            }
        })
    }
}
export const decorService = new DecorService();
