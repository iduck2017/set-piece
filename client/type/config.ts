import { ModelTmpl } from "./template";
import { ModelDef } from "./definition";
import { LinkerType } from "./linker";
import { ModelType } from "./model";

export type ModelConfig<
    M extends ModelTmpl
> = {
    id?: string
    code: M[ModelDef.Code]
    rule?: Partial<M[ModelDef.Rule]>
    originState: M[ModelDef.State]
    childChunkList: ModelType.ChildConfigList<M>,
    childChunkDict: ModelType.ChildConfigDict<M>,
    emitterChunkDict?: LinkerType.ConfigDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict?: LinkerType.ConfigDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict?: LinkerType.ConfigDict<M[ModelDef.State]>
}

export type RawModelConfig<
    M extends ModelTmpl
> = {
    id?: string
    code: M[ModelDef.Code]
    rule?: Partial<M[ModelDef.Rule]>
    originState?: Partial<M[ModelDef.State]>
    childChunkList?: ModelType.ChildConfigList<M>,
    childChunkDict?: Partial<ModelType.ChildConfigDict<M>>,
    emitterChunkDict?: LinkerType.ConfigDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict?: LinkerType.ConfigDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict?: LinkerType.ConfigDict<M[ModelDef.State]>
}