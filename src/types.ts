export type Callback<R = any, P extends any[] = any[]> = (...args: P) => R
export type Constructor<T> = new (...args: any[]) => T
export type Decorator<M, R> = (
    prototype: M, 
    key: string, 
    descriptor: TypedPropertyDescriptor<Callback<R>>
) => TypedPropertyDescriptor<Callback<R>>;
