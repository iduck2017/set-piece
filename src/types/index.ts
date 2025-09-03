import { Primitive } from "utility-types";

export type Value = Primitive | Primitive[] | Record<string, Primitive>
export type Type<T> = abstract new (...args: any[]) => T
export type Method<R = any, P extends any[] = any[]> = (...args: P) => R
