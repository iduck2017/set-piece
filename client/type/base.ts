import { } from 'utility-types';

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
export type RequiredOf<M extends Base.Dict> = {
    [K in KeyOf<M> as M[K] extends Required<M>[K]? K : never]: M[K]
}
export type PartialOf<M extends Base.Dict> = {
    [K in KeyOf<M> as M[K] extends Required<M>[K]? never : K]: M[K]
}
export type ValidOf<M extends Base.Dict> = {
    [K in KeyOf<RequiredOf<M>> as M[K] extends never ? never : K]: M[K]
} & {
    [K in KeyOf<PartialOf<M>> as M[K] extends never ? never : K]?: M[K]
}

export type Strict<M extends Base.Dict> = KeyOf<M> extends never ? Record<Base.Key, never> : M;

export type Editable<M extends Base.Dict> = {
    -readonly [K in KeyOf<M>]: M[K]
}

export type Override<
    A extends Base.Dict, 
    B extends Base.Dict
> = A & Omit<B, KeyOf<A>>