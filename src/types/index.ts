import { Primitive } from "utility-types";
import { Model } from "../model";

export type Value = any

export type IType<T = any, P extends any[] = any[]> = abstract new (...args: P) => T
export type Type<T = any, P extends any[] = any[]> = new (...args: P) => T

export type Method<R = any, P extends any[] = any[]> = (...args: P) => R
