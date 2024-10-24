// 基本类型
export namespace Base {
    export type Key = string | number | symbol
    export type Value = string | number | boolean
    export type Dict = Record<Key, any>
    export type List = Array<any>
    export type Data = Record<Key, Value>
    export type VoidData = Record<Key, never>
    export type VoidList = Array<never>
    export type Function = (...args: any) => any
    export type Class = new (...args: any) => any
    export type Signal<T> = new (signal: T) => T | undefined
}

// 对象遍历
export type ValueOf<M extends Base.Dict> = M[KeyOf<M>];
export type KeyOf<M extends Base.Dict> = keyof M & string;

