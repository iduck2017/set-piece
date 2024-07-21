import type { Model } from "../models/base";
import type { Calculable } from "../utils/calculable";
import { BaseData, BaseKey } from "./base";
import type { BaseDef } from "./definition";

export type BaseModel = Model<BaseDef>
export type BaseList = Array<BaseModel>
export type BaseDict = Record<BaseKey, BaseModel>;

export type BaseCalc = Calculable<
    BaseData, BaseData, BaseData
>;

