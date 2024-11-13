import { OptionalKeys, RequiredKeys } from "utility-types";

export namespace Base {
    export type Key = string | number | symbol
    export type Value = string | number | boolean | undefined
    export type Dict = Record<Key, any>
    export type List = Array<any>
    export type Data = Record<Key, Value | Value[]>
    export type Func<R = any> = (...args: any) => R
    export type Class<T = any> = new (...args: any) => T
    export type Event<E = any> = (event: E) => E | void
}

export type KeyOf<M extends Base.Dict> = keyof M & string;
export type ValueOf<M extends Base.Dict> = M[KeyOf<M>];
export type ValidOf<M extends Base.Dict> = {
    [K in RequiredKeys<M> as M[K] extends never ? never : K]: M[K]
} & {
    [K in OptionalKeys<M> as M[K] extends never ? never : K]?: M[K]
}

export type Strict<M extends Base.Dict> = KeyOf<M> extends never ? Record<Base.Key, never> : M;