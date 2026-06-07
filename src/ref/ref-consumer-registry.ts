import { Model } from "../model";
import { Tag } from "../tag/tag-registry";

class RefConsumerRegistry {
    private _context: WeakMap<Model, Set<Tag>> = new WeakMap();

    public add(ref: Model, consumerTag: Tag) {
        const tags = this._context.get(ref) ?? new Set();
        tags.add(consumerTag);
        this._context.set(ref, tags);
    }

    public remove(ref: Model, consumerTag: Tag) {
        const tags = this._context.get(ref);
        if (!tags) return;
        tags.delete(consumerTag);
    }

    public query(ref: Model): Tag[] {
        const result = this._context.get(ref);
        return [...result ?? []]
    }
}

export const refConsumerRegistry = new RefConsumerRegistry();
