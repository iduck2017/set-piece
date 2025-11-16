import { DeepReadonly, Primitive } from "utility-types"

export type Class<T extends Object = Object, P extends any[] = any[]> = new (...args: P) => T
export type IClass<T extends Object = Object, P extends any[] = any[]> = abstract new (...args: P) => T

export type Method<R = any, P extends any[] = any[]> = (...args: P) => R

export type Child<C> = { [K in keyof C]: C[K] extends any[] ? Readonly<C[K]> : C[K] }
export type Refer<R> = { [K in keyof R]: R[K] extends any[] ? Readonly<R[K]> : R[K] | undefined }
export type State<S> = { [K in keyof S]: S[K] extends Primitive ? S[K] : DeepReadonly<S[K]> }