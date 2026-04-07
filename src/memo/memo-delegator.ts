import { Field } from "../utils/field-registry";

class MemoDelegator {
    private _context: WeakMap<Field, any> = new WeakMap();

    public query(memoField: Field): any {
        return this._context.get(memoField);
    }

    public update(memoField: Field, value: any) {
        this._context.set(memoField, value);
    }

    public clear(memoField: Field) {
        this._context.delete(memoField);
    }
    public check(memoField: Field) {
        return this._context.has(memoField);
    }
}


export const memoDelegator = new MemoDelegator()