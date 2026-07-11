import { Frame } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

type FrameConsumerTagsMap = Map<Constructor<Frame>, Array<Tag>>
class FrameConsumerManager {
    private _context: WeakMap<Model, FrameConsumerTagsMap> = new WeakMap();

    /**
     * Link one producer model and frame type to one consumer method tag.
     *
     * This is the producer-to-consumer runtime index used by frame emission.
     *
     * @param frameProducerModel - Model that may emit the frame.
     * @param frameType - Frame constructor the consumer is interested in.
     * @param frameConsumerTag - Tag pointing to the consumer method.
     * @returns Nothing.
     */
    public add(
        frameProducerModel: Model,
        frameType: Constructor<Frame>,
        frameConsumerTag: Tag,
    ) {
        const subContext: FrameConsumerTagsMap = this._context.get(frameProducerModel) ?? new Map();
        const frameConsumerTags = subContext.get(frameType) ?? [];
        frameConsumerTags.push(frameConsumerTag);
        subContext.set(frameType, frameConsumerTags);
        this._context.set(frameProducerModel, subContext);
    }

    /**
     * Remove one producer/frame/consumer runtime link.
     *
     * This is called when a consumer is unbound because its loader dependencies
     * changed.
     *
     * @param frameProducerModel - Producer model that owns the runtime link.
     * @param frameType - Frame constructor for the runtime link.
     * @param frameConsumerTag - Consumer method tag to remove.
     * @returns Nothing.
     */
    public remove(
        frameProducerModel: Model,
        frameType: Constructor<Frame>,
        frameConsumerTag: Tag,
    ) {
        const subContext: FrameConsumerTagsMap = this._context.get(frameProducerModel) ?? new Map();
        const frameConsumerTags = subContext.get(frameType) ?? [];
        const index = frameConsumerTags.indexOf(frameConsumerTag);
        if (index === -1) return;
        frameConsumerTags.splice(index, 1);
        subContext.set(frameType, frameConsumerTags);
        this._context.set(frameProducerModel, subContext);
    }

    /**
     * Return frame consumer links for a producer.
     *
     * Without a frame, this returns the full frame-type map. With a frame, this
     * returns only consumer tags bound to that frame constructor.
     *
     * @param frameProducerModel - Producer model whose links should be read.
     * @param frame - Optional emitted frame used to filter by constructor.
     * @returns Either the full link map or the matching consumer tags.
     */
    public query(frameProducerModel: Model): FrameConsumerTagsMap
    public query(frameProducerModel: Model, frame: Frame): Array<Tag>
    public query(
        frameProducerModel: Model,
        frame?: Frame
    ) {
        if (!frame) return this._context.get(frameProducerModel) ?? new Map();
        const frameType: any = frame.constructor;
        const subContext: FrameConsumerTagsMap = this._context.get(frameProducerModel) ?? new Map();
        const frameConsumerTags = subContext.get(frameType) ?? [];
        return [...frameConsumerTags];
    }
}

export const frameConsumerManager = new FrameConsumerManager();
