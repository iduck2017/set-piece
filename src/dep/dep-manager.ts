
import { Field } from "../utils/field-registry";

class DepManager {
    private _context: WeakMap<Field, Field[]> = new WeakMap();

    public query(depConsumer: Field) {
        return this._context.get(depConsumer) ?? [];
    }

    public bind(depConsumer: Field, dep: Field) {
        const deps = this._context.get(depConsumer) ?? [];
        deps.push(dep);
        this._context.set(depConsumer, deps);
    }

    public unbind(depConsumer: Field, dep: Field) {
        const deps = this._context.get(depConsumer) ?? [];
        const index = deps.indexOf(dep);
        if (index === -1) return;
        deps.splice(index, 1);
        this._context.set(depConsumer, deps);
    }
}
export const depManager = new DepManager();