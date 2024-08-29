/* eslint-disable max-len */
import { ModelDef } from "./definition";
import { ModelTmpl } from "./template";
import { IConnector } from "./connector";
import type { IModel } from "./model";

export type ModelChunk<
    M extends ModelTmpl
> = {
    code: M[ModelDef.Code]
    id: string
    rule: Partial<M[ModelDef.Rule]>
    originState: M[ModelDef.State]
    childChunkList: IModel.ChildChunkList<M>,
    childChunkDict: IModel.ChildChunkDict<M>,
    emitterChunkDict: IConnector.ChunkDict<M[ModelDef.EmitterEventDict]>
    handlerChunkDict: IConnector.ChunkDict<M[ModelDef.HandlerEventDict]>
    updaterChunkDict: IConnector.ChunkDict<M[ModelDef.State]>
}