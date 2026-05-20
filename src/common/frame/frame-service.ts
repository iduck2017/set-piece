import { Frame } from ".";
import { Model } from "../../model";
import { View } from "../../view";
import { Tag } from "../tag/tag-registry";
import { frameConsumerManager } from "./frame-consumer-manager";
import { frameConsumerRegistry } from "./frame-consumer-registry";
import { frameProducerManager } from "./frame-producer-manager";
import { frameResolver } from "./frame-resolver";

class FrameService {
    public emit(frameProducerModel: Model, frame: Frame) {
        const frameConsumerTags = frameConsumerManager.query(frameProducerModel, frame);
        frameConsumerTags.forEach(frameConsumerTag => {
            const consumerView = frameConsumerTag.target;
            const key = frameConsumerTag.key;
            const handler = Reflect.get(consumerView, key);
            if (!(handler instanceof Function)) return;
            frameResolver.register(() => handler.call(consumerView, frame));
        });
    }

    public unbind(frameConsumerTag: Tag<View>) {
        const frameTypesMap = frameProducerManager.query(frameConsumerTag);
        frameTypesMap.forEach((frameTypes, frameProducerModel) => {
            frameTypes.forEach(type => {
                frameConsumerManager.remove(frameProducerModel, type, frameConsumerTag);
            })
        })
        frameProducerManager.remove(frameConsumerTag);
    }

    public bind(frameConsumerTag: Tag<View>) {
        const consumerView = frameConsumerTag.target;
        const consumerKey = frameConsumerTag.key;
        const loadersMap = frameConsumerRegistry.query(consumerView);
        const loaders = loadersMap.get(consumerKey) ?? [];
        loaders.forEach(loader => {
            const result = loader(consumerView);
            if (!result) return;
            const [value, FrameConstructor] = result;
            if (value instanceof Array) {
                value.forEach(frameProducerModel => {
                    if (!frameProducerModel) return;
                    frameConsumerManager.add(frameProducerModel, FrameConstructor, frameConsumerTag);
                    frameProducerManager.add(frameConsumerTag, frameProducerModel, FrameConstructor);
                })
            }
            if (value instanceof Model) {
                const frameProducerModel = value;
                frameConsumerManager.add(frameProducerModel, FrameConstructor, frameConsumerTag);
                frameProducerManager.add(frameConsumerTag, frameProducerModel, FrameConstructor);
            }
        })
    }
}

export const frameService = new FrameService()
