/* eslint-disable max-len */
import { ModelDef } from "./definition";
import { ModelTmpl } from "./template";
import { LinkerType } from "./linker";
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
    emitterChunkDict: LinkerType.ChunkDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict: LinkerType.ChunkDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict: LinkerType.ChunkDict<M[ModelDef.State]>
}