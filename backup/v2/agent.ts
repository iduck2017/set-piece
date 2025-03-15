import { Def } from "./define";
import { RequiredKeys } from "utility-types";
import { BaseModel, Model } from "./model";
import { EventProducers } from "./event";
import { DecorReceivers } from "./decor";

type ChildAgent<T extends Def> = 
    { [K in RequiredKeys<Def.Child<T>>]: Model.Agent<Required<Def.Child<T>>[K]> } & 
    { [K in keyof Def.Child<T>]?: Model.Agent<Required<Def.Child<T>>[K]> }

type ChildGroupAgent<T extends Def> = 
    { [K in RequiredKeys<Def.ChildGroup<T>>]: Model.Agent<Required<Def.ChildGroup<T>>[K][number]> } & 
    { [K in keyof Def.ChildGroup<T>]?: Model.Agent<Required<Def.ChildGroup<T>>[K][number]> }

export class Agent<T extends Def, M extends BaseModel> {
    readonly child!: ChildAgent<T>;
    readonly childGroup!: ChildGroupAgent<T>;

    readonly event!: EventProducers<T, M>;
    readonly decor!: DecorReceivers<T, M>;

}
