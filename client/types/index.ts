// 基本类型
export namespace Base {
    export type Key = string | number | symbol
    export type Value = string | number | boolean
    export type Dict = Record<Key, any>
    export type Data = Record<Key, Value>
    export type VoidData = Record<never, never>
    export type VoidList = Array<never>
    export type Function = (params: any) => any
    export type Class = new (...args: any) => any
}

export type ValueOf<M extends Base.Dict> = M extends Array<any> ? M[number] : M[keyof M];
export type KeyOf<M extends Base.Dict> = keyof M & string;
export type Optional<T> = T | undefined;
export type Validate<A extends B, B> = A

// 重写部分参数
export type Override< 
    B extends Base.Dict,
    A extends Base.Dict,
> = Omit<A, KeyOf<B>> & B
