import { Calculable } from "../utils/calculable";
import { BaseData } from "./base";
import { DataCheckBeforeEvent, DataUpdateDoneEvent } from "./events";

export enum GenderType {
    MALE    = 100000,
    FEMALE  = 100001,
    NONE    = 100002,
}

export type BaseCalc = Calculable<
    BaseData, 
    BaseData, 
    BaseData
>;

export type CalcIntf =  {
    dataUpdateDone : DataUpdateDoneEvent,
    dataCheckBefore: DataCheckBeforeEvent, 
}
