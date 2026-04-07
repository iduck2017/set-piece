import { Field } from "../utils/field-registry";

class EventManager {
    private _context: WeakMap<Field, Field[]> = new WeakMap();

    public query(dep: Field): Field[] {
        const eventConsumerFields = this._context.get(dep) ?? [];
        return [...eventConsumerFields];
    }

    public unbind(dep: Field, eventConsumerField?: Field) {
        if (!eventConsumerField) return this._context.delete(dep);
        const eventConsumerFields = this._context.get(dep) ?? [];
        const index = eventConsumerFields.indexOf(eventConsumerField);
        if (index === -1) return;
        eventConsumerFields.splice(index, 1);
        this._context.set(dep, eventConsumerFields);
    }

    public bind(dep: Field, eventConsumerField: Field) {
        const eventConsumerFields = this._context.get(dep) ?? [];
        if (eventConsumerFields.includes(eventConsumerField)) return;
        eventConsumerFields.push(eventConsumerField);
        this._context.set(dep, eventConsumerFields);
    }
}

export const eventManager = new EventManager();
