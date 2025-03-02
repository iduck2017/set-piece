export type Value = string | number | boolean | undefined | Readonly<any>
export type Callback<R = any, P extends any[] = any[]> = (...args: P) => R