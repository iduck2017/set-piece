import type { Model } from "../models";
import { ModelDef } from "./model-def";

export type StateUpdateBefore<
    M extends ModelDef, T
> = {
    target: Model<M>,
    prev: T,
    next: T,
    canncel?: boolean
}
    
export type StateUpdateDone<
    M extends ModelDef, T
> = {
    target: Model<M>,
    next: T,
    prev: T,
}
