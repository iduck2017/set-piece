import { OptionalKeys, RequiredKeys } from "utility-types";

export namespace Base {
    export type Key = string | number;
    export type Dict<T = any> = Record<string, T>
    export type List<T = any> = Array<T>
    export type Func<R = any> = (...args: List) => R
    export type Class<T = any> = new (...args: List) => T
    export type Value = string | number | boolean | undefined
    export type Values = Value | Value[]
}

export namespace Dict {
    export type Key<M extends Base.Dict> = keyof M & string;
    export type Value<M extends Base.Dict> = M[Key<M>];

    export type Override<A extends Base.Dict, B extends Base.Dict> = A & Omit<B, Dict.Key<A>>;
    export type Strict<M extends Base.Dict> = Dict.Key<M> extends never ? Base.Dict<never> : M;
    
    export type Valid<M extends Base.Dict> = 
        { [K in RequiredKeys<M> as M[K] extends never ? never : K]: M[K] } & 
        { [K in OptionalKeys<M> as M[K] extends never ? never : K]?: M[K] }
}