import type { Model } from "../model";

export class Tag {
    protected _brand = Symbol('tag');
    constructor(
        public readonly target: Model,
        public readonly key: string
    ) {}

    public get name() {
        return `${this.target.name}.${this.key}`
    }
}

class TagRegistry {
    private _config: WeakMap<Model, Map<string, Tag>> = new WeakMap();

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
