import { Field } from "../utils/field-registry";

class DecorManager {
    private _context: WeakMap<Field,  Field[]> = new WeakMap();

    public query(dep: Field): Field[] {
        const decorConsumerFields = this._context.get(dep) ?? [];
        return [...decorConsumerFields];
    }

    public unbind(dep: Field, decorConsumerField?: Field) {
        if (!decorConsumerField) return this._context.delete(dep);
        const depConsumers = this._context.get(dep) ?? [];
        const index = depConsumers.indexOf(decorConsumerField);
        if (index === -1) return;
        depConsumers.splice(index, 1);
        this._context.set(dep, depConsumers);
    }

    public bind(dep: Field, decorConsumerField: Field) {
        const depConsumers = this._context.get(dep) ?? [];
        if (depConsumers.includes(decorConsumerField)) return;
        depConsumers.push(decorConsumerField);
        this._context.set(dep, depConsumers);
    }
}
export const decorManager = new DecorManager();
