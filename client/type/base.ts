export namespace Base {
    export type Key = string | number | symbol
    export type Value = string | number | boolean
    export type Map = Record<Key, any>
    export type Set = Array<any>
    export type Data = Record<Key, Value | Value[]>
    export type Function = (...args: any) => any
    export type Class = new (...args: any) => any
}

export type KeyOf<M extends Record<string, any>> = keyof M & string;
export type ValueOf<M extends Record<string, any>> = M[KeyOf<M>];
