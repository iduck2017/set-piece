import { Decor } from ".";
import { Model } from "..";
import { Constructor } from "../../types";
import { Tag } from "../../common/tag/tag-registry";

type DecorConsumerTagsMap = Map<Constructor<Decor>, Array<Tag<Model>>>
class DecorConsumerManager {
    private _context: WeakMap<Model, DecorConsumerTagsMap>= new WeakMap();

    public add(
        decorProducerModel: Model,
        decorType: Constructor<Decor>,
        decorConsumerTag: Tag<Model>,
    ) {
        const subContext: DecorConsumerTagsMap = this._context.get(decorProducerModel) ?? new Map();
        const decorConsumerTags = subContext.get(decorType) ?? [];
        decorConsumerTags.push(decorConsumerTag);
        subContext.set(decorType, decorConsumerTags);
        this._context.set(decorProducerModel, subContext);
    }

    public remove(
        decorProducerModel: Model,
        decorType: Constructor<Decor>,
        decorConsumerTag: Tag<Model>,
    ) {
        const subContext: DecorConsumerTagsMap = this._context.get(decorProducerModel) ?? new Map();
        const decorConsumerTags = subContext.get(decorType) ?? [];
        const index = decorConsumerTags.indexOf(decorConsumerTag);
        if (index === -1) return;
        decorConsumerTags.splice(index, 1);
        subContext.set(decorType, decorConsumerTags);
        this._context.set(decorProducerModel, subContext);
    }

    public query(decorProducerModel: Model): Map<Constructor<Decor>, Array<Tag<Model>>>
    public query(decorProducerModel: Model, decor: Decor): Array<Tag<Model>>
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
