/* eslint-disable @typescript-eslint/no-explicit-any */

type BaseKey = string | number | symbol
type BaseType = string | number | boolean | undefined
type BaseFunction = (...args: any[]) => any
type BaseConstructor = new (...args: any[]) => any & BaseRecord
type BaseRecord = Record<any, any>
type VoidRecord = Record<never, never>;

export {
    BaseKey,
    BaseType,
    BaseFunction,
    BaseConstructor,
    BaseRecord,
    VoidRecord
};