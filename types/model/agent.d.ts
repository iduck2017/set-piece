import { DecorReceivers } from "../types/decor";
import { EventProducers } from "../types/event";
import { Model } from "./model";
import { Value } from "../types";
export type ChildAgent<C1 extends Record<string, Model>, C2 extends Model> = C1 extends C1 ? {
    [K in keyof C1]: Model.Agent<Required<C1>[K]>;
} & {
    [0]: Model.Agent<C2>;
} : never;
export declare class Agent<E extends Record<string, any> = Record<string, any>, S2 extends Record<string, Value> = Record<string, Value>, C1 extends Record<string, Model> = Record<string, Model>, C2 extends Model = Model, M extends Model = Model> {
    readonly child: Readonly<ChildAgent<C1, C2>>;
    readonly event: Readonly<EventProducers<E, M>>;
    readonly decor: Readonly<DecorReceivers<S2, M>>;
    readonly path?: string;
    readonly target: M;
    constructor(target: M, path?: string);
    private getDecor;
    private getEvent;
    private getAgent;
}
