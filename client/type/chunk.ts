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
    originState: M[ModelDef.State]
    childChunkList: ModelReflect.ChildChunkList<M>,
    childChunkDict: ModelReflect.ChildChunkDict<M>,
    emitterChunkDict: EventReflect.ChunkDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict: EventReflect.ChunkDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict: EventReflect.ChunkDict<M[ModelDef.State]>
}