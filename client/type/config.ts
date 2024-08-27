import { ModelTmpl } from "./template";
import { EventReflect  } from "./event";
import { ModelDef } from "./definition";
import { ModelReflect } from "./model";

export type ModelConfig<
    M extends ModelTmpl
> = {
    id?: string
    code: M[ModelDef.Code]
    rule?: Partial<M[ModelDef.Rule]>
    originState: M[ModelDef.State]
    childChunkList: ModelReflect.ChildChunkList<M>,
    childChunkDict: ModelReflect.ChildChunkDict<M>,
    emitterChunkDict?: EventReflect.ChunkDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict?: EventReflect.ChunkDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict?: EventReflect.ChunkDict<M[ModelDef.State]>
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
    emitterChunkDict?: EventReflect.ChunkDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict?: EventReflect.ChunkDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict?: EventReflect.ChunkDict<M[ModelDef.State]>
}