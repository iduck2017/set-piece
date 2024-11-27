import { IModel, Model } from "@/model";
import { Base, KeyOf } from "@/type/base";
import { StateOf } from "@/type/model";

export class Decor {
    private static _decors: Map<Function, Record<string, boolean>> = new Map();
    static getDecors<S extends Base.Data>(target: Model, prev: S): Partial<S> {
        const mask = Decor._decors.get(target.constructor) || {};
        const result: any = {};
        for (const key in mask) {
            if (mask[key]) {
                result[key] = prev[key];
            }
        }
        return result;
    }

    static useDecor<N extends Model>(state: {
        [K in KeyOf<StateOf<N>>]: boolean
    }) {
        return function (Type: new (...args: any[]) => N) {
            Decor._decors.set(Type, state);
        };
    }
}