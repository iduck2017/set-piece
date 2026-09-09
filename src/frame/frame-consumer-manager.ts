import { Frame } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

type FrameConsumerTagsMap = Map<Constructor<Frame>, Array<Tag>>
/**
 * Stores runtime frame producer-to-consumer links.
 */
class FrameConsumerManager {
    private _links: WeakMap<Model, FrameConsumerTagsMap> = new WeakMap();

    /**
     * Link one producer model and frame type to one consumer method tag.
     *
     * This is the producer-to-consumer runtime index used by frame emission.
     *
     * @param producer - Model that may emit the frame.
     * @param type - Frame constructor the consumer is interested in.
     * @param consumerTag - Tag pointing to the consumer method.
     * @returns Nothing.
     */
    public add(
        producer: Model,
        type: Constructor<Frame>,
        consumerTag: Tag,
    ) {
        const links: FrameConsumerTagsMap = this._links.get(producer) ?? new Map();
        const consumerTags = links.get(type) ?? [];
        if (consumerTags.includes(consumerTag)) return;
        consumerTags.push(consumerTag);
        links.set(type, consumerTags);
        this._links.set(producer, links);
    }

    /**
     * Remove one producer/frame/consumer runtime link.
     *
     * This is called when a consumer is unbound because its loader dependencies
     * changed.
     *
     * @param producer - Producer model that owns the runtime link.
     * @param type - Frame constructor for the runtime link.
     * @param consumerTag - Consumer method tag to remove.
     * @returns Nothing.
     */
    public remove(
        producer: Model,
        type: Constructor<Frame>,
        consumerTag: Tag,
    ) {
        const links: FrameConsumerTagsMap = this._links.get(producer) ?? new Map();
        const consumerTags = links.get(type) ?? [];
        const index = consumerTags.indexOf(consumerTag);
        if (index === -1) return;
        consumerTags.splice(index, 1);
        links.set(type, consumerTags);
        this._links.set(producer, links);
    }

    /**
     * Return frame consumer links for a producer.
     *
     * Without a frame, this returns the full frame-type map. With a frame, this
     * returns only consumer tags bound to that frame constructor.
     *
     * @param producer - Producer model whose links should be read.
     * @param frame - Optional emitted frame used to filter by constructor.
     * @returns Either the full link map or the matching consumer tags.
     */
    public query(producer: Model): FrameConsumerTagsMap
    public query(producer: Model, frame: Frame): Array<Tag>
    public query(
        producer: Model,
        frame?: Frame
    ) {
        if (!frame) return this._links.get(producer) ?? new Map();
        const type: any = frame.constructor;
        const links: FrameConsumerTagsMap = this._links.get(producer) ?? new Map();
        const consumerTags = links.get(type) ?? [];
        return [...consumerTags];
    }
}

export const frameConsumerManager = new FrameConsumerManager();
