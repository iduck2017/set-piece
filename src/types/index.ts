import { Primitive } from "utility-types";

export type Value = Primitive | Primitive[] | Record<string, Primitive>

export type Constructor<T> = new (...args: any[]) => T
export type IConstructor<T> = abstract new (...args: any[]) => T
export type Callback<R = any, P extends any[] = any[]> = (...args: P) => R

export type Decorator<M, R> = (
    prototype: M, 
    key: string, 
    descriptor: TypedPropertyDescriptor<Callback<R>>
) => TypedPropertyDescriptor<Callback<R>>;

