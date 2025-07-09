export type Optional<T extends Record<string, any>> = { [K in keyof T]: T[K] | undefined; }

export type Callback<R = any, P extends any[] = any[]> = (...args: P) => R
export type Decorator<M, R> = (
    prototype: M, 
    key: string, 
    descriptor: TypedPropertyDescriptor<Callback<R>>
) => TypedPropertyDescriptor<Callback<R>>;

