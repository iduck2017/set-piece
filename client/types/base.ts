export type BaseKey = string | number | symbol
export type BaseType = string | number | boolean | undefined

export type VoidList = Array<never>
export type VoidData = Record<never, never>

export type BaseArray = Array<any>
export type BaseRecord = Record<BaseKey, any>
export type BaseData = Record<BaseKey, BaseType>
export type BaseFunc = (...args: BaseArray) => any
export type BaseIntf = Record<BaseKey, BaseFunc>
export type BaseClass = new (...args: BaseArray) => any

export type ElemOf<T extends BaseArray> = T[number]
export type ValueOf<T extends BaseRecord> = T[keyof T];

export type Union<
    A extends BaseRecord, 
    B extends BaseRecord
> = A & Omit<B, keyof A> 