import { Tag } from "../tag/tag-registry";

class DepCollector {
    private _context: Map<Tag, Tag[]> = new Map();

    public collect(tag: Tag) {
        this._context.forEach((tags) => {
            if (tags.includes(tag)) return;
            tags.push(tag);
        })
    }

    public init(depConsumerTag: Tag) {
        const tags = this._context.get(depConsumerTag) ?? [];
        this._context.set(depConsumerTag, tags);
    }

    public clear(depConsumerTag: Tag) {
        this._context.delete(depConsumerTag);
    }

    public query(depConsumerTag: Tag) {
        return this._context.get(depConsumerTag) ?? [];
    }
}

export const depCollector = new DepCollector();
