import type { Model } from "../models/base";
import { BaseData, BaseFunction, BaseKey, VoidData, VoidList } from "./base";
import { CheckBeforeEvent, EventId, UpdateDoneEvent } from "./events";
import type { 
    DictChunk, 
    ListChunk, 
    ModelRefer
} from "./common";

type PureTmpl<
    M extends Partial<BaseTmpl>
> = M & Omit<{
    [0]: number,
    [1]: VoidData,
    [2]: VoidData,
    [3]: VoidData,
    [4]: BaseModel,
    [5]: VoidList,
    [6]: VoidData,
    [7]: VoidData,
    [8]: VoidData,
}, keyof M>

type BaseTmpl = {
    [0]: number,
    [1]: BaseData,
    [2]: BaseData,
    [3]: BaseData,
    [4]: BaseModel,
    [5]: BaseList,
    [6]: BaseDict,
    [7]: BaseIntf,
    [8]: BaseIntf,
}
type BaseList = Array<BaseModel>
type BaseDict = Record<BaseKey, BaseModel>;
type BaseIntf = Record<BaseKey, BaseFunction>
type BaseModel = Model<BaseTmpl>;
type BaseConf<M extends BaseTmpl> = {
    referId?: string;
    modelId: M[0];
    rule: M[1];
    info: M[2],
    stat: M[3];
    list: M[5],
    dict: M[6],
    intf: M[8],
    emitter: ModelRefer<ModelIntf<M[7]>>
    handler: ModelRefer<M[8]>,
}

type ModelIntf<E extends BaseIntf> = E & {
    [EventId.CHECK_BEFORE]: CheckBeforeEvent, 
    [EventId.UPDATE_DONE]: UpdateDoneEvent,
}

type ModelChunk<M extends BaseTmpl> = {
    referId: string,
    modelId: M[0],
    rule: M[1],
    stat: M[3],
    list: ListChunk<M[5]>,
    dict: DictChunk<M[6]>
    emitter: ModelRefer<ModelIntf<M[7]>>
    handler: ModelRefer<M[8]>,
}


type ModelConf<M extends BaseTmpl> = {
    referId?: string;
    rule: M[1];
    stat?: Partial<M[3]>
    list?: M[5],
    dict?: Partial<M[6]>
    emitter?: ModelRefer<ModelIntf<M[7]>>
    handler?: ModelRefer<M[8]>,
}

export {
    BaseModel,
    BaseIntf,

    BaseDict,
    BaseList,
    BaseConf,
    BaseTmpl,

    ModelChunk,
    ModelIntf,
    ModelConf,

    PureTmpl
};