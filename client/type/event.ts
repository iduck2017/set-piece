import type { Model } from "../models";
import type { IModelDef } from "./definition";
import { ModelKey } from "./registry";

export namespace EventDecl { 
    export type StateUpdateBefore<
        M extends IModelDef.Base,
        K extends keyof M[ModelKey.State]
    > = {
        target: Model<M>,
        next: M[ModelKey.State][K],
        prev: M[ModelKey.State][K]
    }

    export type StateUpdateDone<
        M extends IModelDef.Base,
    > = {
        target: Model<M>,
        state: M[ModelKey.State]
    }

    export type ChildUpdateDone<
        M extends IModelDef.Base,
    > = {
        target: Model<M>,
        children: Model[]
    }
}