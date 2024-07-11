import { Receivable } from "../utils/receivable";
import { Callable } from "../utils/callable";
import { BaseIntf, BaseRecord } from "./base";

export type RecvRef<H extends BaseIntf> = { [K in keyof H]?: Array<Callable<Pick<H, K>>> }
export type CallRef<E extends BaseIntf> = { [K in keyof E]?: Array<Receivable<Pick<E, K>>>}
export type KeyRef<E extends BaseRecord> = { [K in keyof E]?: string[] }