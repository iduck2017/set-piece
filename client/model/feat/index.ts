import { IModel, Model } from "@/model";
import { Factory } from "@/service/factory";
import { Dict, Value } from "@/type/base";
import { ChunkOf } from "@/type/model";
import { ICard } from "../card";

export class IFeat<
    T extends string = string,
    S extends Dict<Value> = Dict,
    C extends Dict<Model> = Dict,
    E extends Dict = Dict,
    P extends Model = Model,
> extends IModel<
    T,
    S & {
        readonly name: string;
        readonly desc: string;
    },
    C,
    E
> {
    declare readonly parent: P;

    protected static merge<T>(
        rule: Partial<T> | undefined,
        overrider: Partial<T> | undefined,
        fallback: T
    ): T {
        const result = fallback;
        for (const key in fallback) {
            if (rule?.[key] !== undefined) {
                result[key] = rule[key];
            }
            if (overrider?.[key] !== undefined) {
                result[key] = overrider[key];
            }
        }
        return result;
    }
}

@Factory.useProduct('feats')
export class Feats<
    T extends IFeat = IFeat,
    P extends Model = Model,
> extends IModel<
    'feats',
    {},
    T[],
    {}
> {
    declare readonly parent: P;

    constructor(
        chunk: ChunkOf<Feats<T>>,
        parent: P
    ) {
        super({
            child: [],
            ...chunk,
            state: {}
        }, parent);
    }
}

