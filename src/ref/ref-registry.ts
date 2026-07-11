import { Model } from "../model";
import { AbstractConstructor } from "../types";

class RefRegistry {
    private _config: Map<AbstractConstructor<Model>, string[]> = new Map();

    /**
     * Remember that a property stores external model references.
     *
     * @param prototype - Prototype that owns the ref property.
     * @param key - Ref property key.
     * @returns Nothing.
     */
    public register(prototype: Model, key: string) {
        const constructor: any = prototype.constructor;
        const keys = this._config.get(constructor) ?? [];
        keys.push(key);
        this._config.set(constructor, keys);
    }

    /**
     * Collect inherited ref property keys for a model.
     *
     * @param prototype - Model instance whose constructor chain is inspected.
     * @returns Ref property keys registered on the model hierarchy.
     */
    public query(prototype: Model): string[] {
        let constructor: any = prototype.constructor;
        const result: string[] = [];
        while (constructor) {
            const keys = this._config.get(constructor) ?? [];
            keys.forEach(key => {
                if (result.includes(key)) return;
                result.push(key);
            });
            constructor = Object.getPrototypeOf(constructor);
        }
        return result;
    }
}

export const refRegistry = new RefRegistry();
