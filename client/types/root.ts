import type { BunnyModel } from "../models/bunny";
import { 
    BaseEvent, 
    BaseList, 
    BaseModel, 
    ModelChunk, 
    ModelConfig
} from "./model";
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
    RootRule,
    RootState,
    BaseEvent,
    BaseEvent,
    BaseList,
    RootDict
>

type RootConfig = ModelConfig<
    RootRule,
    RootState,
    BaseEvent,
    BaseEvent,
    BaseList,
    RootDict
>

export {
    RootRule,
    RootState,
    RootChunk,
    RootConfig,
    RootDict
};