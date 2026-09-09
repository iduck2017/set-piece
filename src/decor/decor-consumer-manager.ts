import { Decor } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

type DecorConsumerTagsMap = Map<Constructor<Decor>, Array<Tag>>
/**
 * Stores runtime decor producer-to-consumer links.
 */
class DecorConsumerManager {
    private _links: WeakMap<Model, DecorConsumerTagsMap>= new WeakMap();

    /**
     * Link one producer model and decor type to one consumer method tag.
     *
     * This is the producer-to-consumer runtime index used when a decor producer
     * emits a decor instance during property reads.
     *
     * @param producer - Model that owns the producer property.
     * @param type - Decor constructor the consumer is interested in.
     * @param consumerTag - Tag pointing to the consumer method.
     * @returns Nothing.
     */
    public add(
        producer: Model,
        type: Constructor<Decor>,
        consumerTag: Tag,
    ) {
        const links: DecorConsumerTagsMap = this._links.get(producer) ?? new Map();
        const consumerTags = links.get(type) ?? [];
        if (consumerTags.includes(consumerTag)) return;
        consumerTags.push(consumerTag);
        links.set(type, consumerTags);
        this._links.set(producer, links);
    }

    /**
     * Remove one producer/decor/consumer runtime link.
     *
     * This is called when a consumer is unbound because its loader dependencies
     * changed.
     *
     * @param producer - Producer model that owns the runtime link.
     * @param type - Decor constructor for the runtime link.
     * @param consumerTag - Consumer method tag to remove.
     * @returns Nothing.
     */
    public remove(
        producer: Model,
        type: Constructor<Decor>,
        consumerTag: Tag,
    ) {
        const links: DecorConsumerTagsMap = this._links.get(producer) ?? new Map();
        const consumerTags = links.get(type) ?? [];
        const index = consumerTags.indexOf(consumerTag);
        if (index === -1) return;
        consumerTags.splice(index, 1);
        links.set(type, consumerTags);
        this._links.set(producer, links);
    }

    /**
     * Return decor consumer links for a producer.
     *
     * Without a decor, this returns the full decor-type map. With a decor, this
     * returns only consumer tags bound to that decor constructor.
     *
     * @param producer - Producer model whose links should be read.
     * @param decor - Optional decor instance used to filter by constructor.
     * @returns Either the full link map or the matching consumer tags.
     */
    public query(producer: Model): Map<Constructor<Decor>, Array<Tag>>
    public query(producer: Model, decor: Decor): Array<Tag>
    public query(
        producer: Model,
        decor?: Decor,
    ) {
        if (!decor) return this._links.get(producer) ?? new Map();
        const type: any = decor.constructor;
        const links: DecorConsumerTagsMap = this._links.get(producer) ?? new Map();
        const consumerTags = links.get(type) ?? [];
        return [...consumerTags];
    }
}
export const decorConsumerManager = new DecorConsumerManager();
