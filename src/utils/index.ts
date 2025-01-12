export type Value = string | number | boolean | undefined | Readonly<any>

export type KeyOf<T extends Record<string, any>> = keyof T & string
