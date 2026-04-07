import { Field } from "../utils/field-registry";

class MemoManager {
    private _context: Map<Field, Field[]> = new Map();

    public query(dep: Field): Field[] {
        const memoFields = this._context.get(dep) ?? [];
        return [...memoFields];
    }

    public bind(dep: Field, memoField: Field) {
        const memoFields = this._context.get(dep) ?? [];
        if (memoFields.includes(memoField)) return;
        memoFields.push(memoField);
        this._context.set(dep, memoFields);
    }

    public unbind(dep: Field, memoField?: Field) {
        if (!memoField) return this._context.delete(dep);
        const memoFields = this._context.get(dep) ?? [];
        const index = memoFields.indexOf(memoField);
        if (index === -1) return;
        memoFields.splice(index, 1);
        this._context.set(dep, memoFields);
    }
}

export const memoManager = new MemoManager();
