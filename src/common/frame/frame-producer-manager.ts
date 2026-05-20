import { Frame } from ".";
import { Model } from "../../model";
import { View } from "../../view";
import { Constructor } from "../../types";
import { Tag } from "../tag/tag-registry";

export type FrameConstructorsMap = Map<Model, Constructor<Frame>[]>
class FrameProducerManager {
    private _context: WeakMap<Tag<View>, FrameConstructorsMap> = new WeakMap();

    public add(
        frameConsumerTag: Tag<View>,
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

    public remove(frameConsumerTag: Tag<View>) {
        this._context.delete(frameConsumerTag);
    }

    public query(frameConsumerTag: Tag<View>): FrameConstructorsMap {
        return this._context.get(frameConsumerTag) ?? new Map();
    }
}

export const frameProducerManager = new FrameProducerManager();
