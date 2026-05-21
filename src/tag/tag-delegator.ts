import { Model } from "../model";
import { Tag, tagRegistry } from "./tag-registry";

class TagDelegator {
    private _context: WeakMap<Tag, any> = new WeakMap();

    public clear(tag: Tag) {
        this._context.delete(tag);
    }

    public get(target: Model, key: string) {
        const tag = tagRegistry.query(target, key);
        return this._context.get(tag);
    }

    public set(target: Model, key: string, value: unknown) {
        const tag = tagRegistry.query(target, key);
        this._context.set(tag, value);
    }
}

export const tagDelegator = new TagDelegator();
