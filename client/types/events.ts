import { BaseKey, BaseRecord, BaseType } from "./base";
import { BaseCalc, BaseNode } from "./model";

export type Event<T extends BaseRecord> = (form: T) => void; 

export type DataCheckBeforeEvent = Event<{
    target: BaseCalc,
    key: BaseKey,
    prev: BaseType,
    next: BaseType,
}>

export type DataUpdateDoneEvent = Event<{
    target: BaseCalc,
    key: BaseKey,
    prev: BaseType,
    next: BaseType,
}>

export type ChildUpdateDoneEvent = Event<{
    target: BaseNode
    child: any
}>

export type DataEvent<K, V> = Event<{
    target: BaseCalc,
    key: K,
    prev: V,
    next: V,
}>

