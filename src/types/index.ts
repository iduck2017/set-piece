import { DeepReadonly, Primitive } from "utility-types"

export type Value = Primitive | Value[] | { [key: string]: Value };

export type Class<T extends Object = Object, P extends any[] = any[]> = new (...args: P) => T
export type IClass<T extends Object = Object, P extends any[] = any[]> = abstract new (...args: P) => T

export type Method<R = any, P extends any[] = any[]> = (...args: P) => R

