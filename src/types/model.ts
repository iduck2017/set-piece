import type { App } from "../app";
import type { Model } from "../models/base";
import { BaseData } from "./base";
import { BaseRefer } from "./common";

type BaseModel = Model<
    number,
    BaseData,
    BaseData,
    BaseData,
    BaseRefer,
    BaseRefer,
    BaseModel | App
>;

type ModelChunk<
    M extends number,
    R extends BaseData,
    S extends BaseData,
    E extends BaseRefer,
    H extends BaseRefer,
> = {
    referId: string,
    modelId: M,
    rule: R,
    state: S,
    emitters: Record<keyof E, string[]>
    handlers: Record<keyof H, string[]>
}

type ModelConfig<
    M extends number,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    E extends BaseRefer,
    H extends BaseRefer,
> = {
    app: App
    referId?: string
    modelId: M
    rule: R
    info: I
    state: S
    emitters: Record<keyof E, string[]>
    handlers: Record<keyof H, string[]>
}

type IModelConfig<
    R extends BaseData,
    S extends BaseData,
    E extends BaseRefer,
    H extends BaseRefer,
> = {
    app: App;
    referId?: string;
    rule: R;
    state?: Partial<S>;
    emitters?: Record<keyof E, string[]>
    handlers?: Record<keyof H, string[]>
}

export {
    BaseModel,
    BaseRefer,
    
    ModelChunk,
    ModelConfig,
    IModelConfig
};