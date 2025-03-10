import { DecorReceivers } from "./decor";
import { EventProducers } from "./event";
import { Model } from "./model";
import { BaseValue } from "./types";

export type ChildAgent<C extends Record<string, Model>> = C extends C ? { [K in keyof C]: Model.Agent<Required<C>[K]> } : never;

export class Agent<
    E extends Record<string, any>,
    S extends Record<string, BaseValue>,
    C extends Record<string, Model>,
    I extends Model,
    M extends Model
> {
    readonly child!: ChildAgent<C>;
    readonly childGroup!: Model.Agent<I>;
    readonly event!: EventProducers<E, M>;
    readonly decor!: DecorReceivers<S, M>;
}