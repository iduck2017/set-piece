import type { BunnyModel } from "../models/bunny";
import { VoidData } from "./base";
import { GenderType } from "./enums";
import { BaseModel, BaseModelDict, ModelConfig } from "./model";

type BunnyRule = VoidData;
type BunnyInfo = VoidData;
type BunnyStat = {
    age: number;
    weight: number;
    gender: GenderType;
}

type BunnyParent = BaseModel;
type BunnyList = BunnyModel[];
type BunnyDict = VoidData;

type BunnyProvider = VoidData;
type BunnyConsumer = VoidData;

type BunnyConfig = ModelConfig<
    BunnyRule,
    BunnyStat,
    BunnyProvider,
    BunnyConsumer,
    BunnyList,
    BunnyDict
>

export {
    BunnyRule,
    BunnyInfo,
    BunnyStat,
    BunnyParent,
    BunnyDict,
    BunnyList,
    BunnyProvider,
    BunnyConsumer,
    BunnyConfig
};
