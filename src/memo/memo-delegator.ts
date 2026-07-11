import { Tag } from "../tag/tag-registry";

class MemoDelegator {
    private _cache: WeakMap<Tag, unknown> = new WeakMap();

    /**
     * Read the cached memo value for a consumer tag.
     *
     * @param tag - Memo consumer tag.
     * @returns Cached memo value.
     */
    public query(tag: Tag): unknown {
        return this._cache.get(tag);
    }

    /**
     * Store the latest memo value for a consumer tag.
     *
     * @param tag - Memo consumer tag.
     * @param value - Value returned by the memo getter.
     * @returns Nothing.
     */
    public update(tag: Tag, value: unknown) {
        this._cache.set(tag, value);
    }

    /**
     * Remove the cached memo value for a consumer tag.
     *
     * @param tag - Memo consumer tag to clear.
     * @returns Nothing.
     */
    public clear(tag: Tag) {
        this._cache.delete(tag);
    }

    /**
     * Check whether a consumer tag already has a cached memo value.
     *
     * @param tag - Memo consumer tag to inspect.
     * @returns True when a cached value exists.
     */
    public check(tag: Tag) {
        return this._cache.has(tag);
    }
}

export const memoDelegator = new MemoDelegator()
