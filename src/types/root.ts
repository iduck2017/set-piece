import { VoidData } from "./base";
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
    never,
    never,
    RootRule,
    RootState,
    VoidData
> & { version: string; }

type RootConfig = IDictConfig<
    never,
    never,
    RootRule,
    RootState,
    VoidData
>

export {
    RootRule,
    RootState,
    RootChunk,
    RootConfig
};