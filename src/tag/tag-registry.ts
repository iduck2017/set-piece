import type { Model } from "../model";

/**
 * Stable identifier for one model property or method.
 */
export class Tag {
    protected _brand = Symbol('tag');
    /**
     * Store the model/key pair that identifies one reactive slot.
     *
     * @param target - Model instance that owns the property.
     * @param key - Property or method key represented by the tag.
     */
    constructor(
        public readonly target: Model,
        public readonly key: string
    ) {}

    public get name() { return `${this.target.name}.${this.key}` }
}

/**
 * Creates and caches tags for model/key pairs.
 */
class TagRegistry {
    private _tags: WeakMap<Model, Map<string, Tag>> = new WeakMap();

    /**
     * Return the stable tag for a model property, creating it if needed.
     *
     * Tags are identity objects used by dependency maps, services, and
     * resolvers. The same model/key pair always returns the same tag.
     *
     * @param target - Model instance that owns the property.
     * @param key - Property or method key.
     * @returns Stable tag for the model/key pair.
     */
    public query(target: Model, key: string): Tag {
        const tags: Map<string, Tag> = this._tags.get(target) ?? new Map();
        const value = tags.get(key)
        if (value) return value;
        const tag = new Tag(target, key);
        tags.set(key, tag);
        this._tags.set(target, tags);
        return tag;
    }
}

export const tagRegistry = new TagRegistry();
