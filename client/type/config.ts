import { ModelTmpl } from "./template";
import { ModelDef } from "./definition";
import { ModelReflect } from "./model";
import { CursorType } from "./cursor";

export type ModelConfig<
    M extends ModelTmpl
> = {
    id?: string
    code: M[ModelDef.Code]
    rule?: Partial<M[ModelDef.Rule]>
    originState: M[ModelDef.State]
    childChunkList: ModelReflect.ChildChunkList<M>,
    childChunkDict: ModelReflect.ChildChunkDict<M>,
    emitterChunkDict?: CursorType.ChunkDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict?: CursorType.ChunkDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict?: CursorType.ChunkDict<M[ModelDef.State]>
}

export type RawModelConfig<
    M extends ModelTmpl
> = {
    id?: string
    code: M[ModelDef.Code]
    rule?: Partial<M[ModelDef.Rule]>
    originState?: Partial<M[ModelDef.State]>
    childChunkList?: ModelReflect.ChildChunkList<M>,
    childChunkDict?: Partial<ModelReflect.ChildChunkDict<M>>,
    emitterChunkDict?: CursorType.ChunkDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict?: CursorType.ChunkDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict?: CursorType.ChunkDict<M[ModelDef.State]>
}