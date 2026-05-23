import { Model } from "../model";
import { Tag } from "../tag/tag-registry";

class RefConsumerRegistry {
    private _context: WeakMap<Model, Set<Tag>> = new WeakMap();

    public add(refModel: Model, consumerTag: Tag) {
        const tags = this._context.get(refModel) ?? new Set();
        tags.add(consumerTag);
        this._context.set(refModel, tags);
    }

    public remove(refModel: Model, consumerTag: Tag) {
        const tags = this._context.get(refModel);
        if (!tags) return;
        tags.delete(consumerTag);
    }

    public query(refModel: Model): Set<Tag> {
        return this._context.get(refModel) ?? new Set();
    }
}

export const refConsumerRegistry = new RefConsumerRegistry();
