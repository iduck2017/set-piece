import type { Model } from "../models/base";
import type { Calculable } from "../utils/calculable";
import { Inheritable } from "../utils/inheritable";
import { BaseArray, BaseData, BaseKey, BaseRecord } from "./base";
import type { BaseDef } from "./definition";

export type BaseModel = Model<BaseDef>
export type BaseList = Array<BaseModel>
export type BaseDict = Record<BaseKey, BaseModel>;

export type BaseCalc = Calculable<BaseData, BaseData, BaseData>;
export type BaseNode = Inheritable<BaseArray, BaseRecord, any>;
