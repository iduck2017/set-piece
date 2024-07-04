import type { BunnyModel } from "../models/bunny";
import { BaseEvent } from "./base";
import { DictChunk, IDictConfig } from "./dict";
import { ModelId } from "./registry";

type RootState = {
    progress: number
}

type RootRule = {
    name: string,
    difficulty: number,
}

type RootChildren = {
    bunny: BunnyModel
}
 
type RootChunk = DictChunk<
    ModelId.ROOT,
    BaseEvent,
    BaseEvent,
    RootRule,
    RootState,
    RootChildren
> & { version: string; }

type RootConfig = IDictConfig<
    BaseEvent,
    BaseEvent,
    RootRule,
    RootState,
    RootChildren
>

export {
    RootRule,
    RootState,
    RootChunk,
    RootConfig,
    RootChildren
};