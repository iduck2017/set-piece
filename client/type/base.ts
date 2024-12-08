import { OptionalKeys, RequiredKeys } from "utility-types";

export namespace Base {
    export type Dict<T = any> = Record<string, T>
    export type List<T = any> = Array<T>
    export type Func<R = any> = (...args: List) => R
    export type Class<T = any> = new (...args: List) => T
    export type Value = string | number | boolean | undefined
}

export type KeyOf<M extends Base.Dict> = keyof M & string;
export type ValOf<M extends Base.Dict> = M[KeyOf<M>];

export type Assign<A extends Base.Dict, B extends Base.Dict> = A & Omit<B, KeyOf<A>>;
export type Strict<M extends Base.Dict> = KeyOf<M> extends never ? Base.Dict<never> : M;
export type Valid<M extends Base.Dict> = {
    [K in RequiredKeys<M> as M[K] extends never ? never : K]: M[K]
} & {
    [K in OptionalKeys<M> as M[K] extends never ? never : K]?: M[K]
}
