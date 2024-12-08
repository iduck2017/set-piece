import { Model } from "@/model.bk";
import { KeyOf, Value } from "@/type/base";
import { StateOf } from "@/type/define";

export class Decor {
    private static _mutators: Map<Function, Record<string, boolean | undefined>> = new Map();
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

    static useMutators<N extends Model>(state: Partial<{
        [K in KeyOf<StateOf<N>>]: boolean
    }>) {
        return function (Type: new (...args: any[]) => N) {
            Decor._mutators.set(Type, state);
        };
    }
}