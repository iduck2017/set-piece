import { Model } from "../model";
import { AbstractConstructor } from "../types";

/**
 * Stores ref property keys declared by `useRef()`.
 */
class RefRegistry {
    private _keys: Map<AbstractConstructor<Model>, string[]> = new Map();

    /**
     * Remember that a property stores external model references.
     *
     * @param prototype - Prototype that owns the ref property.
     * @param key - Ref property key.
     * @returns Nothing.
     */
    public register(prototype: Model, key: string) {
        const ctor: any = prototype.constructor;
        const keys = this._keys.get(ctor) ?? [];
        keys.push(key);
        this._keys.set(ctor, keys);
    }

    /**
     * Collect inherited ref property keys for a model.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Ref property keys registered on the model hierarchy.
     */
    public query(prototype: Model): string[] {
        let ctor: any = prototype.constructor;
        const refs: string[] = [];
        while (ctor) {
            const keys = this._keys.get(ctor) ?? [];
            keys.forEach(key => {
                if (refs.includes(key)) return;
                refs.push(key);
            });
            ctor = Object.getPrototypeOf(ctor);
        }
        return refs;
    }
}

export const refRegistry = new RefRegistry();
