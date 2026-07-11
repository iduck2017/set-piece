import { Model } from "../model";
import { Tag, tagRegistry } from "./tag-registry";

class TagDelegator {
    private _context: WeakMap<Tag, any> = new WeakMap();

    /**
     * Remove the stored value for a tag.
     *
     * @param tag - Tag whose backing value should be cleared.
     * @returns Nothing.
     */
    public clear(tag: Tag) {
        this._context.delete(tag);
    }

    /**
     * Read a value from the stable tag behind a model property.
     *
     * @param target - Model instance that owns the property.
     * @param key - Property key.
     * @returns Stored property value.
     */
    public get(target: Model, key: string) {
        const tag = tagRegistry.query(target, key);
        return this._context.get(tag);
    }

    /**
     * Write a value to the stable tag behind a model property.
     *
     * @param target - Model instance that owns the property.
     * @param key - Property key.
     * @param value - Value to store.
     * @returns Nothing.
     */
    public set(target: Model, key: string, value: unknown) {
        const tag = tagRegistry.query(target, key);
        this._context.set(tag, value);
    }
}

export const tagDelegator = new TagDelegator();
