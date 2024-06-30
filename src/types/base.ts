/* eslint-disable @typescript-eslint/no-explicit-any */

type BaseKey = string | number | symbol
type BaseType = string | number | boolean | undefined
type BaseData = Record<string, BaseType>
type VoidData = Record<string, never>
type BaseRecord = Record<any, any>
type BaseFunction = (...args: any[]) => any
type BaseConstructor = new (...args: any[]) => any & BaseRecord

type PartialOf<
    T extends BaseRecord, 
    P extends keyof T
> = {
    [K in P]: T[K] 
}

export {
    BaseKey,
    BaseType,
    BaseData,
    VoidData,
    BaseRecord,
    BaseFunction,
    BaseConstructor,

    PartialOf
};