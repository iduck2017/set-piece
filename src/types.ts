import { Model } from "./model";

export type Constructor<T, P extends any[] = any[]> = new (...args: P) => T;
export type AbstractConstructor<T> = abstract new (...args: any[]) => T;

export type Method<R = any, P extends any[] = any[]> = (...args: P) => R;

export type TypedPropertyDecorator<I, K> = (target: I, key: K) => void;


