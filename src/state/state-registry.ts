import type { Model } from "../model";

/** Stores persistent state property keys declared by useState(). */
class StateRegistry {
    private _keys: Map<Function, Set<string>> = new Map();

    /** Register a state field on its declaring constructor. */
    public register(prototype: Model, key: string) {
        const ctor = prototype.constructor;
        const keys = this._keys.get(ctor) ?? new Set<string>();
        keys.add(key);
        this._keys.set(ctor, keys);
    }

    /** Collect state fields across the model's constructor hierarchy. */
    public query(model: Model): string[] {
        const keys = new Set<string>();
        let ctor: any = model.constructor;
        while (ctor) {
            const current = this._keys.get(ctor);
            current?.forEach(key => keys.add(key));
            ctor = Object.getPrototypeOf(ctor);
        }
        return [...keys];
    }
}

export const stateRegistry = new StateRegistry();
