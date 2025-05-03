export type Callback<R = any, P extends any[] = any[]> = (...args: P) => R

export type Constructor<T = any, P extends any[] = any[]> = new (...args: P) => T;

export type BaseValue = string | number | boolean | undefined;

export type Value = 
    BaseValue | 
    BaseValue[] | 
    Record<string, BaseValue>;

