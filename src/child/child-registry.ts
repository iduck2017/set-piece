import { Model } from "../model";
import { AbstractConstructor } from "../types";

export type ChildIteratorMap = Map<string, ChildIterator>
export type ChildIterator = (model: Model & Record<string, any>, key: string) => Model[];
class ChildRegistry {
    private _config: Map<AbstractConstructor<Model>, ChildIteratorMap> = new Map();

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
