import type { BunnyModel } from "../models/bunny";
import { VoidData } from "./base";
import { BaseModel, ModelConfig } from "./model";

type RootRule = {
    name: string;
    difficulty: number;
};
type RootInfo = VoidData;
type RootStat = {
    progress: number
}

type RootParent = BaseModel;
type RootList = never[];
type RootDict = {
    bunny: BunnyModel
}

type RootProvider = VoidData;
type RootConsumer = VoidData;

type RootConfig = ModelConfig<
    RootRule,
    RootStat,
    RootProvider,
    RootConsumer,
    RootList,
    RootDict
>

export {
    RootRule,
    RootInfo,
    RootStat,
    RootParent,
    RootDict,
    RootList,
    RootProvider,
    RootConsumer,
    RootConfig
};
