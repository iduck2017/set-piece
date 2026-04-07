import { Field } from "../utils/field-registry";

class StateDelegator {
    private _context: WeakMap<Field, any> = new WeakMap();

    public query(decorProducerField: Field): any {
        return this._context.get(decorProducerField);
    }

    public update(decorProducerField: Field, value: any) {
        this._context.set(decorProducerField, value);
    }

    public clear(decorProducerField: Field) {
        this._context.delete(decorProducerField);
    }

    public check(decorProducerField: Field) {
        return this._context.has(decorProducerField);
    }
}
export const stateDelegator = new StateDelegator();
