import { Frame } from ".";
import { Model } from "../model";
import { Tag } from "../tag/tag-registry";
import { frameConsumerManager } from "./frame-consumer-manager";
import { frameConsumerRegistry } from "./frame-consumer-registry";
import { frameProducerManager } from "./frame-producer-manager";
import { frameResolver } from "./frame-resolver";

class FrameService {
    /**
     * Queue a frame for every consumer currently bound to the producer.
     *
     * This is called by model `emit(frame)` and by frame producers. It does not
     * invoke handlers immediately; it delegates to `frameResolver` so anime
     * boundaries can batch and order delivery.
     *
     * @param frameProducerModel - Model that emitted or produced the frame.
     * @param frame - Frame instance to deliver to matching consumers.
     * @returns Nothing.
     */
    public emit(frameProducerModel: Model, frame: Frame) {
        const frameConsumerTags = frameConsumerManager.query(frameProducerModel, frame);
        frameConsumerTags.forEach(frameConsumerTag => {
            frameResolver.register(frameConsumerTag, frame);
        });
    }

    /**
     * Remove all runtime frame links owned by one consumer tag.
     *
     * This is used before rebinding a consumer whose loader dependencies
     * changed. It clears both producer-to-consumer and consumer-to-producer
     * indexes.
     *
     * @param frameConsumerTag - Tag pointing to the consumer method to unbind.
     * @returns Nothing.
     */
    public unbind(frameConsumerTag: Tag) {
        const frameTypesMap = frameProducerManager.query(frameConsumerTag);
        frameTypesMap.forEach((frameTypes, frameProducerModel) => {
            frameTypes.forEach(type => {
                frameConsumerManager.remove(frameProducerModel, type, frameConsumerTag);
            })
        })
        frameProducerManager.remove(frameConsumerTag);
    }

    /**
     * Run frame consumer loaders and create runtime links.
     *
     * The loader returns a producer model or producer model list plus the frame
     * constructor it wants to consume. This method stores those links in both
     * frame managers so emit and future unbind operations can find them.
     *
     * @param frameConsumerTag - Tag pointing to the consumer method to bind.
     * @returns Nothing.
     */
    public bind(frameConsumerTag: Tag) {
        const consumerModel = frameConsumerTag.target;
        const consumerKey = frameConsumerTag.key;
        const loadersMap = frameConsumerRegistry.query(consumerModel);
        const loaders = loadersMap.get(consumerKey) ?? [];
        loaders.forEach(loader => {
            const result = loader(consumerModel);
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
