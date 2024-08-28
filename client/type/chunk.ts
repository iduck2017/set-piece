/* eslint-disable max-len */
import { ModelDef } from "./definition";
import { ModelTmpl } from "./template";
import { CursorType } from "./cursor";
import type { ModelType } from "./model";

export type ModelChunk<
    M extends ModelTmpl
> = {
    code: M[ModelDef.Code]
    id: string
    rule: Partial<M[ModelDef.Rule]>
    originState: M[ModelDef.State]
    childChunkList: ModelType.ChildChunkList<M>,
    childChunkDict: ModelType.ChildChunkDict<M>,
    emitterChunkDict: CursorType.ChunkDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict: CursorType.ChunkDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict: CursorType.ChunkDict<M[ModelDef.State]>
}