import { Model } from "../model";

class FieldDelegator {
    private _context: WeakMap<Model, Map<string, any>> = new WeakMap();

    public query(model: Model, key: string) {
        return this._context.get(model)?.get(key);
    }

    public update(model: Model, key: string, value: any) {
        const subContext = this._context.get(model) ?? new Map();
        subContext.set(key, value);
        this._context.set(model, subContext);
    }

    public remove(model: Model, key: string) {
        const subContext = this._context.get(model) ?? new Map();
        subContext.delete(key);
        this._context.set(model, subContext);
    }

    public access(model: Model, key: string) {
        const desc = Object.getOwnPropertyDescriptor(model, key);
        const setter = desc?.set ?? function(this: Model, value: any) {
            fieldDelegator.update(this, key, value);
        };
        const getter = desc?.get ?? function(this: Model) {
            return fieldDelegator.query(this, key);
        };
        return [getter, setter] as const;
    }
}

export const fieldDelegator = new FieldDelegator();
