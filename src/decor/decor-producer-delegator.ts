import { Tag } from "../tag/tag-registry";

class DecorProducerDelegator {
    private _context: WeakMap<Tag, any> = new WeakMap();

    public query(decorProducerTag: Tag): any {
        return this._context.get(decorProducerTag);
    }

    public update(decorProducerTag: Tag, value: any) {
        this._context.set(decorProducerTag, value);
    }

    public clear(decorProducerTag: Tag) {
        this._context.delete(decorProducerTag);
    }

    public check(decorProducerTag: Tag) {
        return this._context.has(decorProducerTag);
    }
}

export const decorProducerDelegator = new DecorProducerDelegator();
