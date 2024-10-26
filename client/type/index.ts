// 基本类型
export namespace Base {
    export type Key = string | number | symbol
    export type Value = string | number | boolean
    export type Dict = Record<Key, any>
    export type Data = Record<Key, Value>
    export type Function = (...args: any) => any
    export type Class = new (...args: any) => any
}

export type KeyOf<M extends Record<string, any>> = keyof M & string;
export type ValueOf<M extends Record<string, any>> = M[KeyOf<M>];
