import { Frame } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

type FrameConsumerTagsMap = Map<Constructor<Frame>, Array<Tag>>
class FrameConsumerManager {
    private _context: WeakMap<Model, FrameConsumerTagsMap> = new WeakMap();

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
