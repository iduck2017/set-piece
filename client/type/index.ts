export namespace Base {
    export type Key = string | number | symbol
    export type Value = string | number | boolean | Value[]
    export type Data = Record<Base.Key, Value>
    export type Dict = Record<Base.Key, any>
    export type VoidDict = Record<Base.Key, never>
    export type Func = (...args: any[]) => any 
    export type Class = new (...args: any[]) => any
}

export namespace Reflect {
    export type Iterator<L extends any[]> = L[number]
    export type Value<M extends Base.Dict> = M[keyof M]
}
