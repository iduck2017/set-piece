import { Decor } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

type DecorConsumerTagsMap = Map<Constructor<Decor>, Array<Tag>>
class DecorConsumerManager {
    private _context: WeakMap<Model, DecorConsumerTagsMap>= new WeakMap();

    /**
     * Link one producer model and decor type to one consumer method tag.
     *
     * This is the producer-to-consumer runtime index used when a decor producer
     * emits a decor instance during property reads.
     *
     * @param decorProducerModel - Model that owns the producer property.
     * @param decorType - Decor constructor the consumer is interested in.
     * @param decorConsumerTag - Tag pointing to the consumer method.
     * @returns Nothing.
     */
    public add(
        decorProducerModel: Model,
        decorType: Constructor<Decor>,
        decorConsumerTag: Tag,
    ) {
        const subContext: DecorConsumerTagsMap = this._context.get(decorProducerModel) ?? new Map();
        const decorConsumerTags = subContext.get(decorType) ?? [];
        decorConsumerTags.push(decorConsumerTag);
        subContext.set(decorType, decorConsumerTags);
        this._context.set(decorProducerModel, subContext);
    }

    /**
     * Remove one producer/decor/consumer runtime link.
     *
     * This is called when a consumer is unbound because its loader dependencies
     * changed.
     *
     * @param decorProducerModel - Producer model that owns the runtime link.
     * @param decorType - Decor constructor for the runtime link.
     * @param decorConsumerTag - Consumer method tag to remove.
     * @returns Nothing.
     */
    public remove(
        decorProducerModel: Model,
        decorType: Constructor<Decor>,
        decorConsumerTag: Tag,
    ) {
        const subContext: DecorConsumerTagsMap = this._context.get(decorProducerModel) ?? new Map();
        const decorConsumerTags = subContext.get(decorType) ?? [];
        const index = decorConsumerTags.indexOf(decorConsumerTag);
        if (index === -1) return;
        decorConsumerTags.splice(index, 1);
        subContext.set(decorType, decorConsumerTags);
        this._context.set(decorProducerModel, subContext);
    }

    /**
     * Return decor consumer links for a producer.
     *
     * Without a decor, this returns the full decor-type map. With a decor, this
     * returns only consumer tags bound to that decor constructor.
     *
     * @param decorProducerModel - Producer model whose links should be read.
     * @param decor - Optional decor instance used to filter by constructor.
     * @returns Either the full link map or the matching consumer tags.
     */
    public query(decorProducerModel: Model): Map<Constructor<Decor>, Array<Tag>>
    public query(decorProducerModel: Model, decor: Decor): Array<Tag>
    public query(
        decorProducerModel: Model,
        decor?: Decor,
    ) {
        if (!decor) return this._context.get(decorProducerModel) ?? new Map();
        const decorType: any = decor.constructor;
        const subContext: DecorConsumerTagsMap = this._context.get(decorProducerModel) ?? new Map();
        const decorConsumerTags = subContext.get(decorType) ?? [];
        return [...decorConsumerTags];
    }
}
export const decorConsumerManager = new DecorConsumerManager();
