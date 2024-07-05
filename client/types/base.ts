type BaseKey = string | number | symbol
type BaseType = string | number | boolean | undefined
type BaseData = Record<string, BaseType>
type VoidData = Record<never, never>
type BaseEvent = Record<string | number, BaseFunction>
type BaseRecord = Record<any, any>
type BaseFunction = (...args: any[]) => any
type BaseConstructor = new (...args: any[]) => any & BaseRecord

export {
    BaseKey,
    BaseType,
    BaseData,
    VoidData,
    BaseEvent,
    BaseRecord,
    BaseFunction,
    BaseConstructor
};