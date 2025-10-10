export type Class<T = any, P extends any[] = any[]> = new (...args: P) => T
export type IClass<T = any, P extends any[] = any[]> = abstract new (...args: P) => T
export type Method<R = any, P extends any[] = any[]> = (...args: P) => R
