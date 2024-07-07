import type { Model } from "../models/base";
import { BaseData, BaseFunction, VoidData, VoidList } from "./base";
import { CheckBeforeEvent, EventId, UpdateDoneEvent } from "./events";
import type { 
    DictChunk, 
    ListChunk, 
    EventChunk
} from "./common";

type BaseTmpl = {
    [0]: number,
    [1]: BaseData,
    [2]: BaseData,
    [3]: BaseData,
    [4]: BaseModel,
    [5]: BaseList,
    [6]: BaseDict,
    [7]: BaseEvent,
    [8]: BaseEvent,
}

type ModelTmpl<
    M extends Partial<BaseTmpl>,
> = M & Omit<BaseTmpl, keyof M>;

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


type BaseList = Array<BaseModel>
type BaseDict = Record<string, BaseModel>;
type BaseEvent = Record<string, BaseFunction>
type BaseModel = Model<BaseTmpl>;

type ModelEvent<
    E extends BaseEvent
> = E & {
    [EventId.CHECK_BEFORE]: CheckBeforeEvent, 
    [EventId.UPDATE_DONE]: UpdateDoneEvent,
}

type ModelChunk<
    M extends BaseTmpl = BaseTmpl
> = {
    referId: string,
    modelId: M[0],
    rule: M[1],
    stat: M[3],
    list: ListChunk<M[5]>,
    dict: DictChunk<M[6]>
    provider: EventChunk<ModelEvent<M[7]>>
    consumer: EventChunk<M[8]>,
}

type BaseConf<
    M extends BaseTmpl = BaseTmpl
> = {
    referId?: string;
    modelId: M[0];
    rule: M[1];
    info: M[2],
    stat: M[3];
    list: M[5],
    dict: M[6],
    handlers: M[8],
    provider: EventChunk<ModelEvent<M[7]>>
    consumer: EventChunk<M[8]>,
}

type ModelConf<
    M extends BaseTmpl = BaseTmpl
> = {
    referId?: string;
    rule: M[1];
    stat?: Partial<M[3]>
    list?: M[5],
    dict?: Partial<M[6]>
    provider?: EventChunk<ModelEvent<M[7]>>
    consumer?: EventChunk<M[8]>,
}

export {
    BaseModel,
    BaseEvent,

    BaseDict,
    BaseList,
    BaseConf,
    BaseTmpl,

    ModelChunk,
    ModelEvent,
    ModelConf,
    ModelTmpl,

    PureTmpl
};