import { Frame } from ".";
import { Model } from "../model";
import { Tag } from "../tag/tag-registry";
import { frameConsumerManager } from "./frame-consumer-manager";
import { frameConsumerRegistry } from "./frame-consumer-registry";
import { frameProducerManager } from "./frame-producer-manager";
import { frameResolver } from "./frame-resolver";

/**
 * Maintains runtime frame listener links and queues emitted frames.
 */
class FrameService {
    /**
     * Queue a frame for every consumer currently bound to the producer.
     *
     * This is called by model `emit(frame)` and by frame producers. It does not
     * invoke handlers immediately; it delegates to `frameResolver` so anime
     * boundaries can batch and order delivery.
     *
     * @param producer - Model that emitted or produced the frame.
     * @param frame - Frame instance to deliver to matching consumers.
     * @returns Nothing.
     */
    public emit(producer: Model, frame: Frame) {
        const consumerTags = frameConsumerManager.query(producer, frame);
        consumerTags.forEach(consumerTag => {
            frameResolver.register(consumerTag, frame);
        });
    }

    /**
     * Remove all runtime frame links owned by one consumer tag.
     *
     * This is used before rebinding a consumer whose loader dependencies
     * changed. It clears both producer-to-consumer and consumer-to-producer
     * indexes.
     *
     * @param consumerTag - Tag pointing to the consumer method to unbind.
     * @returns Nothing.
     */
    public unbind(consumerTag: Tag) {
        /** Read reverse links so each old producer/type pair can be removed. */
        const links = frameProducerManager.query(consumerTag);
        links.forEach((types, producer) => {
            types.forEach(type => {
                frameConsumerManager.remove(producer, type, consumerTag);
            })
        })
        /** Drop the reverse index after producer links are cleared. */
        frameProducerManager.remove(consumerTag);
    }

    /**
     * Run frame consumer loaders and create runtime links.
     *
     * The loader returns a producer model or producer model list plus the frame
     * constructor it wants to consume. This method stores those links in both
     * frame managers so emit and future unbind operations can find them.
     *
     * @param consumerTag - Tag pointing to the consumer method to bind.
     * @returns Nothing.
     */
    public bind(consumerTag: Tag) {
        /** Find every loader declared on this consumer method. */
        const consumer = consumerTag.target;
        const key = consumerTag.key;
        const loaderMap = frameConsumerRegistry.query(consumer);
        const loaders = loaderMap.get(key) ?? [];
        /** Run loaders and create links for single or list producer targets. */
        loaders.forEach(loader => {
            const binding = loader(consumer);
            if (!binding) return;
            const [value, FrameCtor] = binding;
            if (value instanceof Array) {
                value.forEach(producer => {
                    if (!producer) return;
                    frameConsumerManager.add(producer, FrameCtor, consumerTag);
                    frameProducerManager.add(consumerTag, producer, FrameCtor);
                })
                return;
            }
            if (!value) return;
            const producer = value;
            frameConsumerManager.add(producer, FrameCtor, consumerTag);
            frameProducerManager.add(consumerTag, producer, FrameCtor);
        })
    }
}

export const frameService = new FrameService()
