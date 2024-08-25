import type { Model } from "../models";
import { Emitter } from "../utils/emitter";
import { Handler } from "../utils/handler";
import { Base } from ".";
import type { ModelTmpl } from "./template";
import type { ModelReflect } from "./model";

export namespace EventReflect {
    export type ExecuteFunc<E> = (event: E) => void;
    export type BindFunc<E> = (handler: Handler<E>) => void
    export type EmitterDict<D extends Base.Dict> = { [K in keyof D]: Emitter<D[K]> }
    export type HandlerDict<D extends Base.Dict> = { [K in keyof D]: Handler<D[K]> }
    export type ExecuteIntf<D extends Base.Dict> = { [K in keyof D]: ExecuteFunc<D[K]> }
    export type BindIntf<D extends Base.Dict> = { [K in keyof D]: BindFunc<D[K]> }
    export type ChunkDict<D extends Base.Dict> = { [K in keyof D]?: string[] }
}

export namespace Event {
    export type StateUpdateBefore<
        M extends ModelTmpl,
        K extends keyof ModelReflect.State<M>
    > = {
        target: Model<M>,
        next: ModelReflect.State<M>[K],
        prev: ModelReflect.State<M>[K]
    }

    export type StateUpdateDone<
        M extends ModelTmpl
    > = {
        target: Model<M>,
        state: ModelReflect.State<M>
    }

    export type ChildUpdateDone<
        M extends ModelTmpl
    > = {
        target: Model<M>,
        children: Model[]
    }
}