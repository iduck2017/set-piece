import { DeepReadonly, Primitive } from "utility-types"
import { Model } from "./model"


export type Callback<R = any, P extends any[] = any[]> = (...args: P) => R
export type Refer<R extends Model.Refer = {}> = { [K in keyof R]: R[K] extends any[] ? Readonly<R[K]> : R[K] | undefined }
export type Child<C extends Model.Child = {}> = { [K in keyof C]: C[K] extends any[] ? Readonly<C[K]> : C[K] }
export type State<S extends Model.State = {}> = { [K in keyof S]: S[K] extends Primitive ? S[K] : DeepReadonly<S[K]> }

export type Event<M extends Model> = {
    onStateChange: Event.OnStateChange<M>
    onChildChange: Event.OnChildChange<M>
    onReferChange: Event.OnReferChange<M>
    onRouteChange: Event.OnRouteChange<M>
}
export namespace Event {
    export type OnStateChange<M extends Model> = { prev: M['state'], next: M['state'] };
    export type OnChildChange<M extends Model> = { prev: M['child'], next: M['child'] };
    export type OnReferChange<M extends Model> = { prev: M['refer'], next: M['refer'] };
    export type OnRouteChange<M extends Model> = { prev: M['route'], next: M['route'] }
}
