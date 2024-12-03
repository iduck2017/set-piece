import { IModel, Model } from "@/model";
import { Dict, Value } from "@/type/base";
import { IMinion } from "./minion";

// export type Minion<
//     T extends string = string,
//     S extends Dict<Value> = Dict<never>,
//     C extends Dict<Model> = Dict<never>,
//     E extends Dict = Dict<never>
// > = ICard<T, S, C & {
//     minion: IMinion
// }, E>

export abstract class ICard<
    T extends string = string,
    S extends Dict<Value> = Dict<never>,
    C extends Dict<Model> = Dict<never>,
    E extends Dict = Dict<never>
> extends IModel<
    T,
    S & {
        readonly name: string;
        readonly desc: string;
    },
    C & {
        minion?: IMinion
    },
    E
> {
}
