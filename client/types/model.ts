import type { Model } from "../models/base";
import type { Calculable } from "../utils/calculable";
import { Emittable } from "../utils/emittable";
import type { Inheritable } from "../utils/inheritable";
import { Receivable } from "../utils/receivable";
import { BaseArray, BaseData, BaseFunc, BaseKey, BaseRecord } from "./base";
import type { BaseDef } from "./definition";

export enum ModelId {
    ROOT = 100000,
    BUNNY = 100003
}

export type BaseModel = Model<BaseDef>
export type BaseList = Array<BaseModel>
export type BaseDict = Record<BaseKey, BaseModel>;

export type BaseCalc = Calculable<BaseData, BaseData, BaseData>;
export type BaseNode = Inheritable<BaseArray, BaseRecord, any>;

export type BaseRecv = Receivable<BaseFunc>
export type BaseCall = Emittable<BaseFunc>