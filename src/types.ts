export type TypedPropertyDecorator<I, K> = (target: I, key: K) => void;

export type Constructor<T, P extends any[] = any[]> = new (...args: P) => T;

export type Method<R, P extends any[] = any[]> = (...args: P) => R;