import { Tag } from "../tag/tag-registry";

/**
 * Caches decorated producer results by producer tag.
 */
class DecorProducerDelegator {
    private _cache: WeakMap<Tag, any> = new WeakMap();

    /**
     * Read the cached decorated value for a producer tag.
     *
     * @param tag - Tag for the decorated producer property.
     * @returns Cached value previously produced by the decor chain.
     */
    public query(tag: Tag): any {
        return this._cache.get(tag);
    }

    /**
     * Store the latest decorated value for a producer tag.
     *
     * @param tag - Tag for the decorated producer property.
     * @param value - Result returned by the latest decor composition.
     * @returns Nothing.
     */
    public update(tag: Tag, value: any) {
        this._cache.set(tag, value);
    }

    /**
     * Remove the cached decorated value for a producer tag.
     *
     * The next property read will recreate the decor and emit it to consumers.
     *
     * @param tag - Tag whose cached value should be removed.
     * @returns Nothing.
     */
    public clear(tag: Tag) {
        this._cache.delete(tag);
    }

    /**
     * Check whether a producer tag already has a decorated value.
     *
     * @param tag - Producer tag to inspect.
     * @returns True when the decorated value is cached.
     */
    public check(tag: Tag) {
        return this._cache.has(tag);
    }
}

export const decorProducerDelegator = new DecorProducerDelegator();
