import { ModelTmpl } from "./template";
import { EventReflect  } from "./event";
import { ModelDef } from "./definition";
import { ModelReflect } from "./model";

export type ModelConfig<
    M extends ModelTmpl
> = {
    code: M[ModelDef.Code]
    id?: string
    rule?: Partial<M[ModelDef.Rule]>
    stableState: M[ModelDef.StableState]
    unstableState: M[ModelDef.UnstableState]
    childChunkList: ModelReflect.ChildChunkList<M>,
    childChunkDict: ModelReflect.ChildChunkDict<M>,
    emitterChunkDict?: EventReflect.ChunkDict<ModelReflect.EmitterEventDict<M>>
    handlerChunkDict?: EventReflect.ChunkDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict?: EventReflect.ChunkDict<ModelReflect.State<M>>
}

export type RawModelConfig<
    M extends ModelTmpl
> = {
    code: M[ModelDef.Code]
    id?: string
    rule?: Partial<M[ModelDef.Rule]>
    unstableState?: Partial<M[ModelDef.UnstableState]>
    childChunkList?: ModelReflect.ChildChunkList<M>,
    childChunkDict?: Partial<ModelReflect.ChildChunkDict<M>>,
    emitterChunkDict?: EventReflect.ChunkDict<ModelReflect.EmitterEventDict<M>>
    handlerChunkDict?: EventReflect.ChunkDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict?: EventReflect.ChunkDict<ModelReflect.State<M>>
}