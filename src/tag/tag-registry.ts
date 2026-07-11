import type { Model } from "../model";

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

class TagRegistry {
    private _config: WeakMap<Model, Map<string, Tag>> = new WeakMap();

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
        const subConfig: Map<string, Tag> = this._config.get(target) ?? new Map();
        const value = subConfig.get(key)
        if (value) return value;
        const tag = new Tag(target, key);
        subConfig.set(key, tag);
        this._config.set(target, subConfig);
        return tag;
    }
}

export const tagRegistry = new TagRegistry();
