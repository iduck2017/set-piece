import { Model } from "../model";
import { AbstractConstructor } from "../types";

export type ChildIteratorMap = Map<string, ChildIterator>
export type ChildIterator = (model: Record<string, any>, key: string) => Model[];

class ChildRegistry {
    private _config: Map<AbstractConstructor<Model>, ChildIteratorMap> = new Map();

    /**
     * Register the iterator that exposes children for a decorated property.
     *
     * `useChild()` calls this during decorator evaluation. `Model.children`
     * later uses the iterator to read current child models from the property.
     *
     * @param prototype - Prototype that owns the child property.
     * @param key - Child property key.
     * @param iterator - Function that extracts child models from the property.
     * @returns Nothing.
     */
    public register(
        prototype: Model, 
        key: string, 
        iterator: ChildIterator
    ) {
        const constructor: any = prototype.constructor;
        const subConfig: ChildIteratorMap = this._config.get(constructor) ?? new Map();
        subConfig.set(key, iterator);
        this._config.set(constructor, subConfig);
    }
    
    /**
     * Collect inherited child iterators for a model instance.
     *
     * @param model - Model instance whose constructor chain is inspected.
     * @returns Map from child property key to child iterator.
     */
    public query(model: Model): ChildIteratorMap {
        const result: ChildIteratorMap = new Map();
        let constructor: any = model.constructor;
        while (constructor) {
            const subConfig: ChildIteratorMap = this._config.get(constructor) ?? new Map();
            subConfig.forEach((iterator, key) => {
                if (result.has(key)) return;
                result.set(key, iterator);
            });
            constructor = Object.getPrototypeOf(constructor);
        }
        return result;
    }
}
export const childRegistry = new ChildRegistry();
