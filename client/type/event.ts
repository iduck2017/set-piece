import type { Model } from "../models";
import type { ModelTmpl } from "./template";
import { ModelDef } from "./definition";

export namespace EventType {
    export type StateUpdateBefore<
        M extends ModelTmpl,
        K extends keyof M[ModelDef.State]
    > = {
        target: Model<M>,
        next: M[ModelDef.State][K],
        prev: M[ModelDef.State][K]
    }

    export type StateUpdateDone<
        M extends ModelTmpl
    > = {
        target: Model<M>,
        state: M[ModelDef.State]
    }

    export type ChildUpdateDone<
        M extends ModelTmpl
    > = {
        target: Model<M>,
        children: Model[]
    }
}