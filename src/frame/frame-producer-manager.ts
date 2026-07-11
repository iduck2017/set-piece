import { Frame } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

export type FrameConstructorsMap = Map<Model, Constructor<Frame>[]>
class FrameProducerManager {
    private _context: WeakMap<Tag, FrameConstructorsMap> = new WeakMap();

    /**
     * Remember which producers a consumer tag is currently bound to.
     *
     * This reverse index lets `frameService.unbind()` remove old links without
     * scanning every producer model.
     *
     * @param frameConsumerTag - Tag pointing to the consumer method.
     * @param frameProducerModel - Producer model selected by the consumer.
     * @param frameType - Frame constructor selected by the consumer.
     * @returns Nothing.
     */
    public add(
        frameConsumerTag: Tag,
        frameProducerModel: Model,
        frameType: Constructor<Frame>,
    ) {
        const subContext: FrameConstructorsMap = this._context.get(frameConsumerTag) ?? new Map();
        const frameTypes = subContext.get(frameProducerModel) ?? [];
        if (frameTypes.includes(frameType)) return;
        frameTypes.push(frameType);
        subContext.set(frameProducerModel, frameTypes);
        this._context.set(frameConsumerTag, subContext);
    }

    /**
     * Drop all producer bindings owned by a consumer tag.
     *
     * @param frameConsumerTag - Tag whose reverse bindings should be cleared.
     * @returns Nothing.
     */
    public remove(frameConsumerTag: Tag) {
        this._context.delete(frameConsumerTag);
    }

    /**
     * Return producer bindings owned by a consumer tag.
     *
     * @param frameConsumerTag - Consumer method tag to inspect.
     * @returns Map from producer model to frame constructors.
     */
    public query(frameConsumerTag: Tag): FrameConstructorsMap {
        return this._context.get(frameConsumerTag) ?? new Map();
    }
}

export const frameProducerManager = new FrameProducerManager();
