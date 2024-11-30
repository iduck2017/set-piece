import { OptionalKeys, RequiredKeys } from "utility-types";

export type Dict<T = any> = Record<string, T>
export type List<T = any> = Array<T>
export type Func<R = any> = (...args: List) => R
export type Class<T = any> = new (...args: List) => T
export type Value = string | number | boolean | undefined

export type KeyOf<M extends Dict> = keyof M & string;
export type ValueOf<M extends Dict> = M[KeyOf<M>];
export type HarshOf<M extends Dict> = KeyOf<M> extends never ? Dict<never> : M;
export type ValidOf<M extends Dict> = {
    [K in RequiredKeys<M> as M[K] extends never ? never : K]: M[K]
} & {
    [K in OptionalKeys<M> as M[K] extends never ? never : K]?: M[K]
}