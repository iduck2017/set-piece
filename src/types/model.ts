import { Primitive, DeepReadonly } from "utility-types"
import { Model } from "../model"

export type Frame<M extends Model> = {
    state: M['state']
    child: M['child']
    refer: M['refer'],
    route: M['route']
}

export type Child<C> = { [K in keyof C]: C[K] extends any[] ? Readonly<C[K]> : C[K] }
export type Refer<R> = { [K in keyof R]: R[K] extends any[] ? Readonly<R[K]> : R[K] | undefined }
export type State<S> = { [K in keyof S]: S[K] extends Primitive ? S[K] : DeepReadonly<S[K]> }

