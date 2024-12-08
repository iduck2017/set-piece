import { Model, NodeModel } from "@/model/node";
import { Base, KeyOf } from "@/type/base";

export class Decor {
    private static _mutators: Map<Function, Record<string, boolean | undefined>> = new Map();
    static GetMutators<S extends Record<string, Base.Value>>(
        target: NodeModel, 
        prev: S
    ): Partial<S> {
        const mask = Decor._mutators.get(target.constructor) || {};
        const result: any = {};
        for (const key in mask) {
            if (mask[key]) {
                result[key] = prev[key];
            }
        }
        return result;
    }

    static useMutators<N extends NodeModel>(state: Partial<{
        [K in KeyOf<Model.State<N>>]: boolean
    }>) {
        return function (Type: new (...args: any[]) => N) {
            Decor._mutators.set(Type, state);
        };
    }
}