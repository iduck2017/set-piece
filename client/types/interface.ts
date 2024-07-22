import { 
    ChildUpdateDoneEvent,
    DataCheckBeforeEvent, 
    DataUpdateDoneEvent 
} from "./events";
import type { BaseModel } from "./model";

export type CalcIntf =  {
    dataUpdateDone : DataUpdateDoneEvent,
    dataCheckBefore: DataCheckBeforeEvent, 
}

export type NodeIntf = {
    childUpdateDone: ChildUpdateDoneEvent
}

export type ModelIntf = CalcIntf & NodeIntf