import { Model } from "../model";
import { Tag, tagRegistry } from "./tag-registry";

class TagDelegator {
    private _context: WeakMap<Tag, any> = new WeakMap();

    public clear(tag: Tag) {
        this._context.delete(tag);
    }

    public get(model: Model, key: string) {
        const tag = tagRegistry.query(model, key);
        return this._context.get(tag);
    }

    public set(model: Model, key: string, value: unknown) {
        const tag = tagRegistry.query(model, key);
        this._context.set(tag, value);
    }
}

export const tagDelegator = new TagDelegator();
