import { VoidData } from "./base";
import { ModelRefer } from "./common";
import { DictChunk, IDictConfig } from "./dict";
import { ModelId } from "./registry";

type RootState = {
    progress: number
}

type RootRule = {
    name: string,
    difficulty: number,
}
 
type RootChunk = DictChunk<
    ModelId.ROOT,
    RootRule,
    RootState,
    ModelRefer,
    ModelRefer,
    VoidData
> & { version: string; }

type RootConfig = IDictConfig<
    RootRule,
    RootState,
    ModelRefer,
    ModelRefer,
    VoidData
>

export {
    RootRule,
    RootState,
    RootChunk,
    RootConfig
};