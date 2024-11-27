import { Model } from "@/model";
import { KeyOf, Value } from "@/type/base";
import { StateOf } from "@/type/model";

export class Decor {
    private static _mutators: Map<Function, Record<string, boolean>> = new Map();
    static GetMutators<S extends Record<string, Value>>(target: Model, prev: S): Partial<S> {
        const mask = Decor._mutators.get(target.constructor) || {};
        const result: any = {};
        for (const key in mask) {
            if (mask[key]) {
                result[key] = prev[key];
            }
        }
        return result;
    }

    static useMutators<N extends Model>(state: {
        [K in KeyOf<StateOf<N>>]: boolean
    }) {
        return function (Type: new (...args: any[]) => N) {
            Decor._mutators.set(Type, state);
        };
    }
}