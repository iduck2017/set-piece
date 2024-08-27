/* eslint-disable max-len */
import { ModelDef } from "./definition";
import { ModelTmpl } from "./template";
import { ModelReflect } from "./model";
import { CursorType } from "./cursor";

export type ModelChunk<
    M extends ModelTmpl
> = {
    code: M[ModelDef.Code]
    id: string
    rule: Partial<M[ModelDef.Rule]>
    originState: M[ModelDef.State]
    childChunkList: ModelReflect.ChildChunkList<M>,
    childChunkDict: ModelReflect.ChildChunkDict<M>,
    emitterChunkDict: CursorType.ChunkDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict: CursorType.ChunkDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict: CursorType.ChunkDict<M[ModelDef.State]>
}