import { Frame } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

export type FrameConstructorsMap = Map<Model, Constructor<Frame>[]>
class FrameProducerManager {
    private _links: WeakMap<Tag, FrameConstructorsMap> = new WeakMap();

    /**
     * Remember which producers a consumer tag is currently bound to.
     *
     * This reverse index lets `frameService.unbind()` remove old links without
     * scanning every producer model.
     *
     * @param consumerTag - Tag pointing to the consumer method.
     * @param producer - Producer model selected by the consumer.
     * @param FrameCtor - Frame constructor selected by the consumer.
     * @returns Nothing.
     */
    public add(
        consumerTag: Tag,
        producer: Model,
        FrameCtor: Constructor<Frame>,
    ) {
        const links: FrameConstructorsMap = this._links.get(consumerTag) ?? new Map();
        const types = links.get(producer) ?? [];
        if (types.includes(FrameCtor)) return;
        types.push(FrameCtor);
        links.set(producer, types);
        this._links.set(consumerTag, links);
    }

    /**
     * Drop all producer bindings owned by a consumer tag.
     *
     * @param consumerTag - Tag whose reverse bindings should be cleared.
     * @returns Nothing.
     */
    public remove(consumerTag: Tag) {
        this._links.delete(consumerTag);
    }

    /**
     * Return producer bindings owned by a consumer tag.
     *
     * @param consumerTag - Consumer method tag to inspect.
     * @returns Map from producer model to frame constructors.
     */
    public query(consumerTag: Tag): FrameConstructorsMap {
        return this._links.get(consumerTag) ?? new Map();
    }
}

export const frameProducerManager = new FrameProducerManager();
