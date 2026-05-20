import { View } from "..";
import { AbstractConstructor } from "../../types";

export type ViewChildIteratorMap = Map<string, ViewChildIterator>
export type ViewChildIterator = (view: View & Record<string, any>, key: string) => View[];
class ViewChildRegistry {
    private _config: Map<AbstractConstructor<View>, ViewChildIteratorMap> = new Map();

    public register(
        prototype: View,
        key: string,
        iterator: ViewChildIterator
    ) {
        const constructor: any = prototype.constructor;
        const subConfig: ViewChildIteratorMap = this._config.get(constructor) ?? new Map();
        subConfig.set(key, iterator);
        this._config.set(constructor, subConfig);
    }

    public query(view: View): ViewChildIteratorMap {
        const result: ViewChildIteratorMap = new Map();
        let constructor: any = view.constructor;
        while (constructor) {
            const subConfig: ViewChildIteratorMap = this._config.get(constructor) ?? new Map();
            subConfig.forEach((iterator, key) => {
                if (result.has(key)) return;
                result.set(key, iterator);
            });
            constructor = Object.getPrototypeOf(constructor);
        }
        return result;
    }
}
export const viewChildRegistry = new ViewChildRegistry();
