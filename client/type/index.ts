export namespace IBase {
    export type Key = string | number | symbol
    export type Value = string | number | boolean | Value[]
    export type Data = Record<Key, Value>
    export type Dict = Record<Key, any>
    export type Func = (...args: any[]) => any 
    export type Class = new (...args: any[]) => any
}

export namespace IReflect {
    export type IteratorOf<L extends any[]> = L[number]
    export type ValueOf<M extends IBase.Dict> = M[keyof M]
    export type KeyOf<M extends IBase.Dict> = keyof M & string
    export type Optional<D> = D extends infer T | undefined ? T : never
}
