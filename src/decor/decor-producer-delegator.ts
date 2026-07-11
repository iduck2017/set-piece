import { Tag } from "../tag/tag-registry";

class DecorProducerDelegator {
    private _context: WeakMap<Tag, any> = new WeakMap();

    /**
     * Read the cached decorated value for a producer tag.
     *
     * @param decorProducerTag - Tag for the decorated producer property.
     * @returns Cached value previously produced by the decor chain.
     */
    public query(decorProducerTag: Tag): any {
        return this._context.get(decorProducerTag);
    }

    /**
     * Store the latest decorated value for a producer tag.
     *
     * @param decorProducerTag - Tag for the decorated producer property.
     * @param value - Result returned by the latest decor composition.
     * @returns Nothing.
     */
    public update(decorProducerTag: Tag, value: any) {
        this._context.set(decorProducerTag, value);
    }

    /**
     * Remove the cached decorated value for a producer tag.
     *
     * The next property read will recreate the decor and emit it to consumers.
     *
     * @param decorProducerTag - Tag whose cached value should be removed.
     * @returns Nothing.
     */
    public clear(decorProducerTag: Tag) {
        this._context.delete(decorProducerTag);
    }

    /**
     * Check whether a producer tag already has a decorated value.
     *
     * @param decorProducerTag - Producer tag to inspect.
     * @returns True when the decorated value is cached.
     */
    public check(decorProducerTag: Tag) {
        return this._context.has(decorProducerTag);
    }
}

export const decorProducerDelegator = new DecorProducerDelegator();
