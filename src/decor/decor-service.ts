import { Model } from "../model";
import { Decor } from ".";
import { decorConsumerManager } from "./decor-consumer-manager";
import { decorConsumerRegistry } from "./decor-consumer-registry";
import { decorProducerManager } from "./decor-producer-manager";
import { Tag } from "../tag/tag-registry";
import { decorProducerResolver } from "./decor-producer-resolver";

class DecorService {
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

    public unbind(decorConsumerTag: Tag) {
        const decorTypesMap = decorProducerManager.query(decorConsumerTag);
        decorTypesMap.forEach((decorTypes, decorProducerModel) => {
            decorTypes.forEach(decorType => {
                // console.log('Decor unbind:', decorConsumerTag.name);
                decorConsumerManager.remove(decorProducerModel, decorType, decorConsumerTag);
                decorProducerResolver.register(decorProducerModel, decorType);
            })
        })
        decorProducerManager.remove(decorConsumerTag);
    }

    public bind(decorConsumerTag: Tag) {
        const consumerModel = decorConsumerTag.target;
        const consumerKey = decorConsumerTag.key;
        const loadersMap = decorConsumerRegistry.query(consumerModel);
        const loaders = loadersMap.get(consumerKey) ?? [];
        loaders.forEach(loader => {
            const [value, decorType] = loader(consumerModel);
            if (value instanceof Array) {
                const decorProducerModels = value;
                decorProducerModels?.forEach(decorProducerModel => {
                    if (!decorProducerModel) return;
                    // console.log('Decor bind:', decorConsumerTag.name);
                    decorConsumerManager.add(decorProducerModel, decorType, decorConsumerTag);
                    decorProducerManager.add(decorConsumerTag, decorProducerModel, decorType);
                    decorProducerResolver.register(decorProducerModel, decorType);
                })
            }
            if (value instanceof Model) {
                const decorProducerModel = value;
                // console.log('Decor bind:', decorConsumerTag.name);
                decorConsumerManager.add(decorProducerModel, decorType, decorConsumerTag);
                decorProducerManager.add(decorConsumerTag, decorProducerModel, decorType);
                decorProducerResolver.register(decorProducerModel, decorType);
            }
        })
    }
}
export const decorService = new DecorService();
