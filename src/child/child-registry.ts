import { Model } from "../model";
import { AbstractConstructor } from "../types";

export type ChildIteratorMap = Map<string, ChildIterator>
export type ChildIterator = (model: Record<string, any>, key: string) => Model[];

class ChildRegistry {
    private _iterators: Map<AbstractConstructor<Model>, ChildIteratorMap> = new Map();

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
        const ctor: any = prototype.constructor;
        const iterators: ChildIteratorMap = this._iterators.get(ctor) ?? new Map();
        iterators.set(key, iterator);
        this._iterators.set(ctor, iterators);
    }
    
    /**
     * Collect inherited child iterators for a model instance.
     *
     * @param model - Model instance whose constructor chain is inspected.
     * @returns Map from child property key to child iterator.
     */
    public query(model: Model): ChildIteratorMap {
        const iterators: ChildIteratorMap = new Map();
        let ctor: any = model.constructor;
        while (ctor) {
            const current: ChildIteratorMap = this._iterators.get(ctor) ?? new Map();
            current.forEach((iterator, key) => {
                if (iterators.has(key)) return;
                iterators.set(key, iterator);
            });
            ctor = Object.getPrototypeOf(ctor);
        }
        return iterators;
    }
}
export const childRegistry = new ChildRegistry();
