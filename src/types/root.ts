import type { App } from "../app";
import { DictModel } from "../models/dict";
import { VoidData } from "./base";
import { VoidRefer } from "./common";
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
    VoidRefer,
    VoidRefer,
    VoidData
> & {
    version: string;
}

type RootConfig = IDictConfig<
    RootRule,
    RootState,
    VoidRefer,
    VoidRefer,
    VoidData
>

const IRootModel = class extends DictModel<
    ModelId.ROOT,
    RootRule,
    VoidData,
    RootState,
    VoidRefer,
    VoidRefer,
    App,
    VoidData
> {};

export {
    RootRule,
    RootState,
    RootChunk,
    RootConfig,
    IRootModel
};