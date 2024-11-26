import { Node, StateOf } from "@/model/node";
import { Base, KeyOf } from "@/type/base";

export class Decor {
    private static _decors: Map<Function, Record<string, boolean>> = new Map();
    static getDecors<S extends Base.Data>(target: Node, prev: S): Partial<S> {
        const mask = Decor._decors.get(target.constructor) || {};
        const result: any = {};
        for (const key in mask) {
            if (mask[key]) {
                result[key] = prev[key];
            }
        }
        return result;
    }

    static useDecor<N extends Node>(state: {
        [K in KeyOf<StateOf<N>>]: boolean
    }) {
        return function (Type: new (...args: any[]) => N) {
            Decor._decors.set(Type, state);
        };
    }
}