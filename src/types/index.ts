export type Callback<R = any, P extends any[] = any[]> = (...args: P) => R

export type Constructor<T = any, P extends any[] = any[]> = new (...args: P) => T;

export type Value = string | number | boolean | undefined | Readonly<any[]> | Readonly<Record<string, any>>;
