import type { Model } from "../models";
import { BaseModelDef } from "./definition";
import { ModelKey } from "./registry";

export namespace EventType { 
    export type StateUpdateBefore<
        M extends BaseModelDef,
        K extends keyof M[ModelKey.State]
    > = {
        target: Model<M>,
        next: M[ModelKey.State][K],
        prev: M[ModelKey.State][K]
    }

    export type StateUpdateDone<
        M extends BaseModelDef,
    > = {
        target: Model<M>,
        state: M[ModelKey.State]
    }

    export type ChildUpdateDone<
        M extends BaseModelDef,
    > = {
        target: Model<M>,
        children: Model[]
    }
}