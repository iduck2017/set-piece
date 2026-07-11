import { Model } from "../model";
import { Decor } from ".";
import { decorConsumerManager } from "./decor-consumer-manager";
import { decorConsumerRegistry } from "./decor-consumer-registry";
import { decorProducerManager } from "./decor-producer-manager";
import { Tag } from "../tag/tag-registry";
import { decorProducerResolver } from "./decor-producer-resolver";

class DecorService {
    /**
     * Apply a decor instance to all currently bound consumers.
     *
     * This is called while a decor producer property is being read. Consumers
     * can mutate the decor object before the producer caches and returns
     * `decor.result`.
     *
     * @param decorProducerModel - Model whose producer property created decor.
     * @param decor - Decor instance passed to matching consumer handlers.
     * @returns Nothing.
     */
    public emit(decorProducerModel: Model, decor: Decor) {
        const decorConsumerTags = decorConsumerManager.query(decorProducerModel, decor);
        decorConsumerTags.forEach(decorConsumerTag => {
            const decorConsumerModel = decorConsumerTag.target;
            const decorConsumerKey = decorConsumerTag.key;
            const handler = Reflect.get(decorConsumerModel, decorConsumerKey);
            if (handler instanceof Function) {
                handler.call(decorConsumerModel, decor);
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
     * @param decorConsumerTag - Tag pointing to the consumer method to unbind.
     * @returns Nothing.
     */
    public unbind(decorConsumerTag: Tag) {
        const decorTypesMap = decorProducerManager.query(decorConsumerTag);
        decorTypesMap.forEach((decorTypes, decorProducerModel) => {
            decorTypes.forEach(decorType => {
                decorConsumerManager.remove(decorProducerModel, decorType, decorConsumerTag);
                decorProducerResolver.register(decorProducerModel, decorType);
            })
        })
        decorProducerManager.remove(decorConsumerTag);
    }

    /**
     * Run decor consumer loaders and create runtime links.
     *
     * The loader returns a producer model or producer model list plus the decor
     * constructor it wants to consume. This method stores those links in both
     * decor managers and queues the producer for recomputation.
     *
     * @param decorConsumerTag - Tag pointing to the consumer method to bind.
     * @returns Nothing.
     */
    public bind(decorConsumerTag: Tag) {
        const consumerModel = decorConsumerTag.target;
        const consumerKey = decorConsumerTag.key;
        const loadersMap = decorConsumerRegistry.query(consumerModel);
        const loaders = loadersMap.get(consumerKey) ?? [];
        loaders.forEach(loader => {
            const result = loader(consumerModel);
            if (!result) return;
            const [value, DecorConstructor] = result;
            if (value instanceof Array) {
                const decorProducerModels = value;
                decorProducerModels?.forEach(decorProducerModel => {
                    if (!decorProducerModel) return;
                    decorConsumerManager.add(decorProducerModel, DecorConstructor, decorConsumerTag);
                    decorProducerManager.add(decorConsumerTag, decorProducerModel, DecorConstructor);
                    decorProducerResolver.register(decorProducerModel, DecorConstructor);
                })
            }
            if (value instanceof Model) {
                const decorProducerModel = value;
                decorConsumerManager.add(decorProducerModel, DecorConstructor, decorConsumerTag);
                decorProducerManager.add(decorConsumerTag, decorProducerModel, DecorConstructor);
                decorProducerResolver.register(decorProducerModel, DecorConstructor);
            }
        })
    }
}
export const decorService = new DecorService();
