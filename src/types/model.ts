import { DeepReadonly, Primitive } from "utility-types"
import { Model } from "../model"
import { RouteUtil } from "../utils/route"
import { EventUtil } from "../utils/event"
import { StateUtil } from "../utils/state"
import { ChildUtil } from "../utils/child"
import { ReferUtil } from "../utils/refer"

export namespace Props {
    export type Event = Record<string, any>
    export type State = Record<string, any>
    export type Child = Record<string, Model | Model[]>
    export type Refer = Record<string, Model | Model[]>
    export type Route = Record<string, Model>
}

export type Route = { parent?: Model, root: Model, order: Model[] }
export type Refer<R extends Model.Refer = {}> = { [K in keyof R]: R[K] extends any[] ? Readonly<R[K]> : R[K] | undefined }
export type Child<C extends Model.Child = {}> = { [K in keyof C]: C[K] extends any[] ? Readonly<C[K]> : C[K] }
export type State<S extends Model.State = {}> = { [K in keyof S]: S[K] extends Primitive ? S[K] : DeepReadonly<S[K]> }
export type Event<E, M extends Model> = E & {
    onStateChange: { prev: M['state'], next: M['state'] }
    onChildChange: { prev: M['child'], next: M['child'] };
    onReferChange: { prev: M['refer'], next: M['refer'] };
    onRouteChange: { prev: M['route'], next: M['route'] }
}
export namespace Event {
    export type OnStateChange<M extends Model> = { prev: M['state'], next: M['state'] };
    export type OnChildChange<M extends Model> = { prev: M['child'], next: M['child'] };
    export type OnReferChange<M extends Model> = { prev: M['refer'], next: M['refer'] };
    export type OnRouteChange<M extends Model> = { prev: M['route'], next: M['route'] };
}

export type Utils<
    M extends Model = Model,
    E extends Model.Event = Model.Event,
    S extends Model.State = Model.State,
    C extends Model.Child = Model.Child,
    R extends Model.Refer = Model.Refer,
> = Readonly<{
    route: RouteUtil<M>
    event: EventUtil<M, E>
    state: StateUtil<M, S>
    child: ChildUtil<M, C>
    refer: ReferUtil<M, R>
}>
