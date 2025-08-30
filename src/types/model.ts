import { Value } from ".";
import { Model } from "../model"
import { Event } from "./event";

export type StateChangeEvent<M extends Model> = Event<{ prev: M['state'], next: M['state'] }>;
export type ChildChangeEvent<M extends Model> = Event<{ prev: M['child'], next: M['child'] }>;
export type ReferChangeEvent<M extends Model> = Event<{ prev: M['refer'], next: M['refer'] }>;
export type RouteChangeEvent<M extends Model> = Event<{ prev: M['route'], next: M['route'] }>;

export namespace Props {
    export type E = Record<string, Event>
    export type S = Record<string, Value>
    export type C = Record<string, Model | Model[]>
    export type R = Record<string, Model | Model[]>
}

export namespace Get {
    export type Route = Readonly<{ root: Model, order: Readonly<Model[]>, parent?: Model }>
    export type State<S extends Props.S = {}> = Readonly<{ [K in keyof S]: S[K] extends object ? Readonly<S[K]> : S[K] }>
    export type Child<C extends Props.C = {}> = Readonly<{ [K in keyof C]: C[K] extends any[] ? Readonly<C[K]> : C[K] }>
    export type Refer<R extends Props.R = {}> = Readonly<{ [K in keyof R]: R[K] extends any[] ? Readonly<R[K]> : R[K] | undefined }>
    export type Event<E, M extends Model> = E & {
        onStateChange: StateChangeEvent<M>
        onChildChange: ChildChangeEvent<M>;
        onReferChange: ReferChangeEvent<M>;
        onRouteChange: RouteChangeEvent<M>;
    }
}
export namespace Set {
    export type Route = { root: Model, order: Model[], parent?: Model }
    export type Child<C extends Props.C = {}> = C;
    export type State<S extends Props.S = {}> = { [K in keyof S]: S[K] extends object ? Readonly<S[K]> : S[K] }
    export type Refer<R extends Props.R = {}> = { [K in keyof R]: R[K] extends any[] ? R[K] : R[K] | undefined }
}