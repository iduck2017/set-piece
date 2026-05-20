import type { Model } from "../../model";
import type { View } from "../../view";

export class Tag<T extends Model | View = Model | View> {
    protected _brand = Symbol('tag');
    constructor(
        public readonly target: T,
        public readonly key: string
    ) {}

    public get name() {
        return `${this.target.name}.${this.key}`
    }
}

class TagRegistry {
    private _config: WeakMap<Model | View, Map<string, Tag<any>>> = new WeakMap();

    public query<T extends Model | View>(target: T, key: string): Tag<T> {
        const subConfig: Map<string, Tag<any>> = this._config.get(target) ?? new Map();
        const value = subConfig.get(key)
        if (value) return value as Tag<T>;
        const tag: Tag<T> = new Tag<T>(target, key);
        subConfig.set(key, tag);
        this._config.set(target, subConfig);
        return tag;
    }
}

export const tagRegistry = new TagRegistry();
