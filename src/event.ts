import { Value } from "./types"
import { Model } from "./model"

export class Event<E = any> {
    constructor(public readonly target: Model) {}
}

export type childUpdateEvent<
    S extends Record<string, Value>,
    C extends Record<string, Model> | Model[]
> = Event<{ 
    target: Model<S, {}, C>
    childPrev: Readonly<C>
    childNext: Readonly<C>
}>

export type StateUpdateEvent<
    S extends Record<string, Value>,
> = Event<{ 
    target: Model<S>, 
    statePrev: Readonly<S>,
    stateNext: Readonly<S>
}>
