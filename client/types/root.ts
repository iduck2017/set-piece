import type { BunnyModel } from "../models/bunny";
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
    never,
    never,
    RootRule,
    RootState,
    RootChildren
> & { version: string; }

type RootConfig = IDictConfig<
    never,
    never,
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