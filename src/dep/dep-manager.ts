
import { Tag } from "../tag/tag-registry";

class DepManager {
    private _context: WeakMap<Tag, Tag[]> = new WeakMap();

    public query(depConsumerTag: Tag) {
        return this._context.get(depConsumerTag) ?? [];
    }

    public add(depConsumerTag: Tag, tag: Tag) {
        const tags = this._context.get(depConsumerTag) ?? [];
        if (tags.includes(tag)) return;
        tags.push(tag);
        this._context.set(depConsumerTag, tags);
    }

    public remove(depConsumerTag: Tag, tag?: Tag) {
        const tags = this._context.get(depConsumerTag) ?? [];
        if (!tag) return this._context.delete(depConsumerTag);
        const index = tags.indexOf(tag);
        if (index === -1) return;
        tags.splice(index, 1);
        this._context.set(depConsumerTag, tags);
    }
}

export const depManager = new DepManager();
