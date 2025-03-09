import { BaseModel } from "@/plugins"
import { BaseValue } from "./common"

export type DecorUpdater<S = any, M extends BaseModel = BaseModel> = (target: M, prev: S) => S

export type DecorReceiver<S = any, M extends BaseModel = BaseModel> = { 
    target: M, 
    key: string, 
    path?: string[] 
}

export type DecorReceivers<
    S extends Record<string, BaseValue>,
    M extends BaseModel
> = { 
    [K in keyof S]: DecorReceiver<Required<S>[K], M> 
}