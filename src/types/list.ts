import { BaseData } from "./base";
import { BaseRefer } from "./common";
import { BaseModel, IModelConfig, ModelChunk, ModelConfig } from "./model";

type ListChunk<
    M extends number,
    R extends BaseData,
    S extends BaseData,
    E extends BaseRefer,
    H extends BaseRefer,
    C extends BaseModel
> = ModelChunk<M, R, S, E, H> & {
    children: C[]
}

type ListConfig<
    M extends number,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    E extends BaseRefer,
    H extends BaseRefer,
    C extends BaseModel
> = ModelConfig<M, R, I, S, E, H> & {
    children: C[]
}

type IListConfig<
    R extends BaseData,
    S extends BaseData,
    E extends BaseRefer,
    H extends BaseRefer,
    C extends BaseModel
> = IModelConfig<R, S, E, H> & {
    children?: C[]
}

export {
    ListChunk,
    ListConfig,
    IListConfig
};