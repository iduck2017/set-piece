import { ModelTmpl } from "./template";
import { ModelDef } from "./definition";
import { IConnector } from "./connector";
import { IModel } from "./model";

export type ModelConfig<
    M extends ModelTmpl
> = {
    id?: string
    code: M[ModelDef.Code]
    rule?: Partial<M[ModelDef.Rule]>
    originState: M[ModelDef.State]
    childChunkList: IModel.ChildConfigList<M>,
    childChunkDict: IModel.ChildConfigDict<M>,
    emitterChunkDict?: IConnector.ConfigDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict?: IConnector.ConfigDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict?: IConnector.ConfigDict<M[ModelDef.State]>
}

export type RawModelConfig<
    M extends ModelTmpl
> = {
    id?: string
    code: M[ModelDef.Code]
    rule?: Partial<M[ModelDef.Rule]>
    originState?: Partial<M[ModelDef.State]>
    childChunkList?: IModel.ChildConfigList<M>,
    childChunkDict?: Partial<IModel.ChildConfigDict<M>>,
    emitterChunkDict?: IConnector.ConfigDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict?: IConnector.ConfigDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict?: IConnector.ConfigDict<M[ModelDef.State]>
}