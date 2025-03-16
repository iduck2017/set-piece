import { DecorReceivers } from "./decor";
import { EventProducers } from "./event";
import { Model } from "./model";
import { Value } from "./types";

export type ChildAgent<
    C1 extends Record<string, Model>,
    C2 extends Model
> = C1 extends C1 ? { [K in keyof C1]: Model.Agent<Required<C1>[K]> } & { [0]: Model.Agent<C2> } : never;

export class Agent<
    E extends Record<string, any>,
    S2 extends Record<string, Value>,
    C1 extends Record<string, Model>,
    C2 extends Model,
    M extends Model
> {
    readonly child!: ChildAgent<C1, C2>;
    readonly event!: EventProducers<E, M>;
    readonly decor!: DecorReceivers<S2, M>;
}