import { Model } from "../model";

const brand = Symbol('property-field');

export type Field = [Model, string, typeof brand]
class FieldRegistry {
    private _config: WeakMap<Model, Map<string, Field>> = new WeakMap();

    public query(model: Model, key: string): Field {
        const subConfig: Map<string, Field> = this._config.get(model) ?? new Map();
        const value = subConfig.get(key)
        if (value) return value;
        const field: Field = [model, key, brand];
        subConfig.set(key, field);
        this._config.set(model, subConfig);
        return field;
    }
}
export const fieldRegistry = new FieldRegistry();
