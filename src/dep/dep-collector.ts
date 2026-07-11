import { Tag } from "../tag/tag-registry";

class DepCollector {
    private _context: Map<Tag, Tag[]> = new Map();

    /**
     * Add a read dependency to every active consumer collection.
     *
     * Reactive getters call this whenever a dependency-backed property is read.
     *
     * @param tag - Dependency tag that was read.
     * @returns Nothing.
     */
    public collect(tag: Tag) {
        this._context.forEach((tags) => {
            if (tags.includes(tag)) return;
            tags.push(tag);
        })
    }

    /**
     * Start collecting dependencies for a consumer tag.
     *
     * Resolvers and registries call this before running a consumer loader,
     * effect, or memo getter.
     *
     * @param depConsumerTag - Consumer tag whose dependency reads are tracked.
     * @returns Nothing.
     */
    public init(depConsumerTag: Tag) {
        const tags = this._context.get(depConsumerTag) ?? [];
        this._context.set(depConsumerTag, tags);
    }

    /**
     * Stop collecting dependencies for a consumer tag.
     *
     * @param depConsumerTag - Consumer tag whose collection should be removed.
     * @returns Nothing.
     */
    public clear(depConsumerTag: Tag) {
        this._context.delete(depConsumerTag);
    }

    /**
     * Return the dependencies collected for a consumer tag.
     *
     * @param depConsumerTag - Consumer tag to inspect.
     * @returns Dependency tags read while the consumer was collecting.
     */
    public query(depConsumerTag: Tag) {
        return this._context.get(depConsumerTag) ?? [];
    }
}

export const depCollector = new DepCollector();
