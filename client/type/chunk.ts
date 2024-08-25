/* eslint-disable max-len */
import { ModelDef } from "./definition";
import { EventReflect } from "./event";
import { ModelTmpl } from "./template";
import { ModelReflect } from "./model";

export type ModelChunk<
    M extends ModelTmpl
> = {
    code: M[ModelDef.Code]
    id: string
    rule: Partial<M[ModelDef.Rule]>
    unstableState: M[ModelDef.UnstableState]
    childChunkList: ModelReflect.ChildChunkList<M>,
    childChunkDict: ModelReflect.ChildChunkDict<M>,
    emitterChunkDict: EventReflect.ChunkDict<ModelReflect.EmitterEventDict<M>>
    handlerChunkDict: EventReflect.ChunkDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict: EventReflect.ChunkDict<ModelReflect.State<M>>
}