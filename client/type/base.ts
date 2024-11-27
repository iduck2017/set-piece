import { OptionalKeys, RequiredKeys } from "utility-types";

export type Value = string | number | boolean | undefined
export type Method<R = any> = (...args: any) => R
export type Class<T = any> = new (...args: any) => T

export type KeyOf<M extends Record<string, any>> = keyof M & string;
export type ValueOf<M extends Record<string, any>> = M[KeyOf<M>];
export type ValidOf<M extends Record<string, any>> = {
    [K in RequiredKeys<M> as M[K] extends never ? never : K]: M[K]
} & {
    [K in OptionalKeys<M> as M[K] extends never ? never : K]?: M[K]
}

export type Strict<M extends Record<string, any>> = 
    KeyOf<M> extends never ? Record<string, never> : M;