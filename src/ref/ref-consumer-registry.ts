import type { Model } from "../model";
import type { Tag } from "../tag/tag-registry";

/**
 * Tracks which tags hold references to each model.
 */
class RefConsumerRegistry {
    private _links: WeakMap<Model, Tag[]> = new WeakMap();

    /**
     * Track that a ref model is held by a consumer tag.
     *
     * @param ref - Referenced model being held.
     * @param consumerTag - Tag for the property holding the reference.
     * @returns Nothing.
     */
    public add(ref: Model, consumerTag: Tag) {
        const tags = this._links.get(ref) ?? [];
        tags.push(consumerTag);
        this._links.set(ref, tags);
    }

    /**
     * Remove one holder relationship from a ref model.
     *
     * @param ref - Referenced model being released.
     * @param consumerTag - Tag for the property releasing the reference.
     * @returns Nothing.
     */
    public remove(ref: Model, consumerTag: Tag) {
        const tags = this._links.get(ref);
        if (!tags) return;
        const index = tags.indexOf(consumerTag);
        if (index === -1) return;
        tags.splice(index, 1);
    }

    /**
     * Return all holders that currently point at a ref model.
     *
     * `RefResolver` uses this to validate passive references after reroute.
     *
     * @param ref - Referenced model to inspect.
     * @returns Tags for properties currently holding the model.
     */
    public query(ref: Model): Tag[] {
        const tags = this._links.get(ref);
        return [...tags ?? []];
    }
}

export const refConsumerRegistry = new RefConsumerRegistry();
