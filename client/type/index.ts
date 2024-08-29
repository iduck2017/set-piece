export namespace IBase {
    export type Key = string | number | symbol
    export type Value = string | number | boolean | Value[]
    export type Data = Record<IBase.Key, Value>
    export type Dict = Record<IBase.Key, any>
    export type VoidDict = Record<IBase.Key, never>
    export type Func = (...args: any[]) => any 
    export type Class = new (...args: any[]) => any
}

export namespace IReflect {
    export type Iterator<L extends any[]> = L[number]
    export type Value<M extends IBase.Dict> = M[keyof M]
}
