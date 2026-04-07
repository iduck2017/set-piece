import { Model } from "../model";
import { AbstractConstructor } from "../types";
import { getTypes } from "../utils/get-types";

export type RefUnbinder = (refSource: Model | undefined, key: string, refTarget: Model | undefined) => void;
export type RefUnbinderMap = Map<string, RefUnbinder>;
class WeakRefRegistry {
    private _context: Map<AbstractConstructor<Model>, RefUnbinderMap> = new Map();

    public register(
        prototype: Model,
        key: string,
        unbinder: RefUnbinder,
    ) {
        const type: any = prototype.constructor;
        const subConfig: RefUnbinderMap = this._context.get(type) ?? new Map();
        subConfig.set(key, unbinder);
        this._context.set(type, subConfig);
    }

    public query(model: Model): RefUnbinderMap {
        const result: RefUnbinderMap = new Map();
        getTypes(model).forEach(type => {
            const subConfig: RefUnbinderMap = this._context.get(type) ?? new Map();
            subConfig.forEach((unbinder, key) => {
                if (result.has(key)) return;
                result.set(key, unbinder);
            });
        });
        return result;
    }
}
export const weakRefRegistry = new WeakRefRegistry();
