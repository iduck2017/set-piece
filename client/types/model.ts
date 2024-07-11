import type { Model } from "../models/base";
import { BaseKey } from "./base";
import type { BaseDef } from "./definition";

export type BaseModel = Model<BaseDef>
export type BaseList = Array<BaseModel>
export type BaseDict = Record<BaseKey, BaseModel>;
