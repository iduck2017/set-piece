import { Model } from "./model"

export type Value = string | number | boolean | undefined | Readonly<any>

export type KeyOf<T extends Record<string, any>> = keyof T & string

export class Event<E = any> {
    constructor(
        public readonly target: Model,
    ) {}
}

export type ChildUpdateEvent<
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
