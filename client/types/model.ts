import type { Model } from "../models/base";
import { BaseFunction, BaseKey, BaseRecord } from "./base";
import { CheckBeforeEvent, EventId, UpdateDoneEvent } from "./events";
import type { BaseTmpl } from "./tmpl";

type BaseModel = Model<BaseTmpl>
type BaseList = Array<BaseModel>
type BaseDict = Record<BaseKey, BaseModel>;
type BaseIntf = Record<BaseKey, BaseFunction>
type BaseRefer<E extends BaseRecord> = { [K in keyof E]?: string[] }

type ModelIntf<E extends BaseIntf> = E & {
    [EventId.CHECK_BEFORE]: CheckBeforeEvent, 
    [EventId.UPDATE_DONE]: UpdateDoneEvent,
}

export {
    BaseModel,
    BaseRefer,
    BaseDict,
    BaseList,
    BaseIntf,

    ModelIntf
};