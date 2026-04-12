import { Tag } from "../tag/tag-registry";

class MemoDelegator {
    private _context: WeakMap<Tag, unknown> = new WeakMap();

    public query(tag: Tag): unknown {
        return this._context.get(tag);
    }

    public update(tag: Tag, value: unknown) {
        this._context.set(tag, value);
    }

    public clear(tag: Tag) {
        this._context.delete(tag);
    }

    public check(tag: Tag) {
        return this._context.has(tag);
    }
}

export const memoDelegator = new MemoDelegator()