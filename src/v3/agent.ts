import { BaseModel, Model } from "./model";
import { EventProducers } from "./event";
import { DecorReceivers } from "./decor";
import { BaseValue } from "./common";

type ChildAgent<C extends Record<string, BaseModel>> = { [K in keyof C]: Model.Agent<Required<C>[K]> }
type ChildGroupAgent<G extends Record<string, BaseModel[]>> = { [K in keyof G]: Model.Agent<Required<G>[K][number]> }

export class Agent<
    E extends Record<string, BaseValue>,
    C extends Record<string, BaseModel>,
    G extends Record<string, BaseModel[]>,
    D extends Record<string, BaseValue>,
    M extends BaseModel
> {
    readonly child!: ChildAgent<C>;
    readonly childGroup!: ChildGroupAgent<G>;
    readonly event!: EventProducers<E, M>;
    readonly decor!: DecorReceivers<D, M>;
}
