import { Decor } from ".";
import { Model } from "../model";
import { Constructor } from "../types";
import { Tag } from "../tag/tag-registry";

export type DecorConstructorsMap = Map<Model, Constructor<Decor>[]>
class DecorProducerManager {
    private _context: WeakMap<Tag, DecorConstructorsMap> = new WeakMap();

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

    public remove(decorConsumerTag: Tag) {
        this._context.delete(decorConsumerTag);
    }

    public query(decorConsumerTag: Tag): DecorConstructorsMap {
        return this._context.get(decorConsumerTag) ?? new Map();
    }
}

export const decorProducerManager = new DecorProducerManager();
