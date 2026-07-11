import { Decor } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

export type DecorConstructorsMap = Map<Model, Constructor<Decor>[]>
class DecorProducerManager {
    private _links: WeakMap<Tag, DecorConstructorsMap> = new WeakMap();

    /**
     * Remember which producers a consumer tag is currently bound to.
     *
     * This reverse index lets `decorService.unbind()` remove old links without
     * scanning every producer model.
     *
     * @param consumerTag - Tag pointing to the consumer method.
     * @param producer - Producer model selected by the consumer.
     * @param DecorCtor - Decor constructor selected by the consumer.
     * @returns Nothing.
     */
    public add(
        consumerTag: Tag,
        producer: Model,
        DecorCtor: Constructor<Decor>,
    ) {
        const links: DecorConstructorsMap = this._links.get(consumerTag) ?? new Map();
        const types = links.get(producer) ?? [];
        if (types.includes(DecorCtor)) return;
        types.push(DecorCtor);
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
     * @returns Map from producer model to decor constructors.
     */
    public query(consumerTag: Tag): DecorConstructorsMap {
        return this._links.get(consumerTag) ?? new Map();
    }
}

export const decorProducerManager = new DecorProducerManager();
