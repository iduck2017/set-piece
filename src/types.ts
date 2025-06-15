import { DeepReadonly, Primitive } from "utility-types"
import { Model } from "./model"


export type Callback<R = any, P extends any[] = any[]> = (...args: P) => R


export type Refer<R extends Model.Refer = Model.Refer> = { [K in keyof R]?: R[K] extends any[] ? Readonly<R[K]> : R[K] }

export type Child<C extends Model.Child = Model.Child> = { [K in keyof C]: C[K] extends any[] ? Readonly<C[K]> : C[K] }

export type State<S extends Model.State = Model.State> = { [K in keyof S]: S[K] extends Primitive ? S[K] : DeepReadonly<S[K]> }

export type Props<
    S1 extends Model.State = {},
    C1 extends Model.Child = {},
    R1 extends Model.Refer = {},
> = {
    uuid?: string
    state?: Partial<S1>
    child?: Partial<C1>
    refer?: Partial<R1>
}


export type OnStateChange<M extends Model> = { prev: M['state'], next: M['state'] };

export type OnChildChange<M extends Model> = { prev: M['child'], next: M['child'] };

export type OnReferChange<M extends Model> = { prev: M['refer'], next: M['refer'] };

export type OnRouteChange<M extends Model> = { prev: M['route'], next: M['route'] }

export type Event<M extends Model> = {
    onStateChange: OnStateChange<M>
    onChildChange: OnChildChange<M>
    onReferChange: OnReferChange<M>
    onRouteChange: OnRouteChange<M>
}


