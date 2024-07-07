type BaseKey = string | number | symbol
type BaseData = Record<string, BaseType>
type BaseType = string | number | boolean | undefined

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