import type { BunnyModel } from "../models/bunny";
import { BaseEvent } from "./base";
import { BaseModel, ModelChunk, ModelTemplate } from "./model";
import { ModelId } from "./registry";

type RootState = {
    progress: number
}

type RootRule = {
    name: string,
    difficulty: number,
}

type RootDict = {
    bunny: BunnyModel
}
 
type RootChunk = ModelChunk<
    ModelId.ROOT,
    BaseEvent,
    BaseEvent,
    RootRule,
    RootState,
    BaseModel[],
    RootDict
>

type RootConfig = ModelTemplate<
    BaseEvent,
    BaseEvent,
    RootRule,
    RootState,
    BaseModel[],
    RootDict
>

export {
    RootRule,
    RootState,
    RootChunk,
    RootConfig,
    RootDict
};