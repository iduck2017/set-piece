import { Calculable } from "../utils/calculable";
import { BaseKey, BaseRecord, BaseType } from "./base";
import { BaseCalc } from "./common";

export type Event<T extends BaseRecord> = (form: T) => void; 

export type DataCheckBeforeEvent = Event<{
    target: BaseCalc,
    key   : BaseKey,
    prev  : BaseType,
    next  : BaseType,
}>

export type DataUpdateDoneEvent = Event<{
    target: BaseCalc,
    key   : BaseKey,
    prev  : BaseType,
    next  : BaseType,
}>
