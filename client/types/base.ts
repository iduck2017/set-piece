type BaseKey = string | number | symbol
type BaseType = string | number | boolean | undefined

type VoidList = never[]
type VoidData = Record<never, never>

type BaseData = Record<BaseKey, BaseType>
type BaseRecord = Record<BaseKey, any>
type BaseFunction = (...args: any[]) => any
type BaseConstructor = new (...args: any[]) => any & BaseRecord

type ElemOf<T extends any[]> = T[number]
type ValueOf<T extends BaseRecord> = T[keyof T];
type UnionOf<
    A extends BaseRecord, 
    B extends BaseRecord
> = A & Omit<B, keyof A> 

export {
    BaseKey,
    BaseType,

    VoidList,
    VoidData,
    
    BaseData,
    BaseRecord,
    BaseFunction,
    BaseConstructor,

    ElemOf,
    ValueOf,
    UnionOf
};