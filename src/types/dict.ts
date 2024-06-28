import { BaseData } from "./base";
import { BaseRefer } from "./common";
import { BaseModel, IModelConfig, ModelChunk, ModelConfig } from "./model";

type DictChunk<
    M extends number,
    R extends BaseData,
    S extends BaseData,
    E extends BaseRefer,
    H extends BaseRefer,
    C extends Record<string, BaseModel>
> = ModelChunk<M, R, S, E, H> & {
    children: C
}

type DictConfig<
    M extends number,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    E extends BaseRefer,
    H extends BaseRefer,
    C extends Record<string, BaseModel>
> = ModelConfig<M, R, I, S, E, H> & {
    children: C
}

type IDictConfig<
    R extends BaseData,
    S extends BaseData,
    E extends BaseRefer,
    H extends BaseRefer,
    C extends Record<string, BaseModel>
> = IModelConfig<R, S, E, H> & {
    children?: Partial<C>
}


export {
    DictChunk,
    DictConfig,
    IDictConfig
};