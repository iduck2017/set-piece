import { BaseModel } from "@/plugins"
import { Def } from "./define"

export type DecorUpdater<S = any, M extends BaseModel = BaseModel> = (target: M, prev: S) => S

export type DecorReceiver<S = any, M extends BaseModel = BaseModel> = { 
    target: M, 
    key: string, 
    path?: string[] 
}

export type DecorReceivers<T extends Def, M extends BaseModel> = { 
    [K in keyof Def.State<T>]: DecorReceiver<Def.State<T>[K], M> 
}