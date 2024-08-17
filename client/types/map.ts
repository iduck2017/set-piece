import { Emittable } from "../utils/emittable";
import { Receivable } from "../utils/receivable";
import { BaseData, BaseRecord } from "./base";
import { DataEvent } from "./events";

export type ConnSeqMap<E extends BaseRecord> = { [K in keyof E]?: string[] }
export type EmitMap<E extends BaseRecord> = { [K in keyof E]: Emittable<E[K]> }
export type RecvMap<E extends BaseRecord> = { [K in keyof E]: Receivable<E[K]> }
export type HookMap<D extends BaseData> = { [K in keyof D]: Emittable<DataEvent<K, D[K]>> }