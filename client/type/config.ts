import { ModelTmpl } from "./template";
import { ModelDef } from "./definition";
import { CursorType } from "./cursor";
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
    emitterChunkDict?: CursorType.ConfigDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict?: CursorType.ConfigDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict?: CursorType.ConfigDict<M[ModelDef.State]>
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
    emitterChunkDict?: CursorType.ConfigDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict?: CursorType.ConfigDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict?: CursorType.ConfigDict<M[ModelDef.State]>
}