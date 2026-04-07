import { Field } from "../utils/field-registry";

class EffectManager {
    // From dep to effectField
    private _context: WeakMap<Field, Field[]> = new WeakMap();

    public query(dep: Field): Field[] {
        const effectFields = this._context.get(dep) ?? [];
        return [...effectFields];
    }

    public unbind(dep: Field, effectField?: Field) {
        if (!effectField) return this._context.delete(dep);
        const effectFields = this._context.get(dep) ?? [];
        const index = effectFields.indexOf(effectField);
        if (index === -1) return;
        effectFields.splice(index, 1);
        this._context.set(dep, effectFields);
    }

    public bind(dep: Field, effectField: Field) {
        const effectFields = this._context.get(dep) ?? [];
        if (effectFields.includes(effectField)) return;
        effectFields.push(effectField);
        this._context.set(dep, effectFields);
    }
}

export const effectManager = new EffectManager();
