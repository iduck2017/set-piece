
import { Tag } from "../tag/tag-registry";

class DepManager {
    private _context: WeakMap<Tag, Tag[]> = new WeakMap();

    /**
     * Return the dependency tags currently owned by a consumer tag.
     *
     * @param depConsumerTag - Consumer tag to inspect.
     * @returns Dependency tags currently connected to the consumer.
     */
    public query(depConsumerTag: Tag) {
        return this._context.get(depConsumerTag) ?? [];
    }

    /**
     * Record that a consumer tag depends on a dependency tag.
     *
     * This is the reverse map used when a consumer is unbound and all of its
     * old dependency edges need to be removed.
     *
     * @param depConsumerTag - Consumer tag that owns the dependency.
     * @param tag - Dependency tag read by the consumer.
     * @returns Nothing.
     */
    public add(depConsumerTag: Tag, tag: Tag) {
        const tags = this._context.get(depConsumerTag) ?? [];
        if (tags.includes(tag)) return;
        tags.push(tag);
        this._context.set(depConsumerTag, tags);
    }

    /**
     * Remove one dependency or all dependencies owned by a consumer tag.
     *
     * @param depConsumerTag - Consumer tag to update.
     * @param tag - Optional dependency tag to remove. When omitted, all edges
     * for the consumer are removed.
     * @returns Nothing.
     */
    public remove(depConsumerTag: Tag, tag?: Tag) {
        const tags = this._context.get(depConsumerTag) ?? [];
        if (!tag) return this._context.delete(depConsumerTag);
        const index = tags.indexOf(tag);
        if (index === -1) return;
        tags.splice(index, 1);
        this._context.set(depConsumerTag, tags);
    }
}

export const depManager = new DepManager();
