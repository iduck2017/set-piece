import { Decor } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

export type DecorConstructorsMap = Map<Model, Constructor<Decor>[]>
class DecorProducerManager {
    private _context: WeakMap<Tag, DecorConstructorsMap> = new WeakMap();

    /**
     * Remember which producers a consumer tag is currently bound to.
     *
     * This reverse index lets `decorService.unbind()` remove old links without
     * scanning every producer model.
     *
     * @param decorConsumerTag - Tag pointing to the consumer method.
     * @param decorProducerModel - Producer model selected by the consumer.
     * @param decorType - Decor constructor selected by the consumer.
     * @returns Nothing.
     */
    public add(
        decorConsumerTag: Tag,
        decorProducerModel: Model,
        decorType: Constructor<Decor>,
    ) {
        const subContext: DecorConstructorsMap = this._context.get(decorConsumerTag) ?? new Map();
        const decorTypes = subContext.get(decorProducerModel) ?? [];
        if (decorTypes.includes(decorType)) return;
        decorTypes.push(decorType);
        subContext.set(decorProducerModel, decorTypes);
        this._context.set(decorConsumerTag, subContext);
    }

    /**
     * Drop all producer bindings owned by a consumer tag.
     *
     * @param decorConsumerTag - Tag whose reverse bindings should be cleared.
     * @returns Nothing.
     */
    public remove(decorConsumerTag: Tag) {
        this._context.delete(decorConsumerTag);
    }

    /**
     * Return producer bindings owned by a consumer tag.
     *
     * @param decorConsumerTag - Consumer method tag to inspect.
     * @returns Map from producer model to decor constructors.
     */
    public query(decorConsumerTag: Tag): DecorConstructorsMap {
        return this._context.get(decorConsumerTag) ?? new Map();
    }
}

export const decorProducerManager = new DecorProducerManager();
