import type { Model } from "../model";
import { ModelDef } from "./model/define";

export namespace EventType {
    export type StateCheckBefore<
        M extends ModelDef, T
    > = {
        target: Model<M>,
        prev: T,
        next: T,
        isAborted?: boolean
    }
        
    export type StateAlterDone<
        M extends ModelDef, T
    > = {
        target: Model<M>,
        next: T,
        prev: T,
    }

    export type CastrateBefore<M extends Model> = {
        model: M,
        isAborted?: boolean
    }

    export type CastrateDone<M extends Model> = {
        model: M,
    }
}
