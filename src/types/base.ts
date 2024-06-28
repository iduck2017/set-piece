/* eslint-disable @typescript-eslint/no-explicit-any */

type BaseKey = string | number | symbol
type BaseType = string | number | boolean | undefined
type BaseData = Record<string, BaseType>
type VoidData = Record<never, never>
type BaseRecord = Record<any, any>
type BaseFunction = (...args: any[]) => any
type BaseConstructor = new (...args: any[]) => any & BaseRecord

export {
    BaseKey,
    BaseType,
    BaseData,
    VoidData,
    BaseRecord,
    BaseFunction,
    BaseConstructor
};