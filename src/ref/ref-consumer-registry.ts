import { Model } from "../model";
import { Tag } from "../tag/tag-registry";

class RefConsumerRegistry {
    private _context: WeakMap<Model, Set<Tag>> = new WeakMap();

    /**
     * Track that a ref model is held by a consumer tag.
     *
     * @param ref - Referenced model being held.
     * @param consumerTag - Tag for the property holding the reference.
     * @returns Nothing.
     */
    public add(ref: Model, consumerTag: Tag) {
        const tags = this._context.get(ref) ?? new Set();
        tags.add(consumerTag);
        this._context.set(ref, tags);
    }

    /**
     * Remove one holder relationship from a ref model.
     *
     * @param ref - Referenced model being released.
     * @param consumerTag - Tag for the property releasing the reference.
     * @returns Nothing.
     */
    public remove(ref: Model, consumerTag: Tag) {
        const tags = this._context.get(ref);
        if (!tags) return;
        tags.delete(consumerTag);
    }

    /**
     * Return all holders that currently point at a ref model.
     *
     * `Model.unlink()` uses this to clear references before a model is removed.
     *
     * @param ref - Referenced model to inspect.
     * @returns Tags for properties currently holding the model.
     */
    public query(ref: Model): Tag[] {
        const result = this._context.get(ref);
        return [...result ?? []]
    }
}

export const refConsumerRegistry = new RefConsumerRegistry();
