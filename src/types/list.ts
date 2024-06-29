import type { App } from "../app";
import { BaseData, VoidData } from "./base";
import { ChunkOf, ModelRefer } from "./common";
import { BaseModel, IModelConfig, ModelChunk, ModelConfig } from "./model";

type ListChunk<
    M extends number,
    R extends BaseData,
    S extends BaseData,
    E extends Record<string, BaseModel[]>,
    H extends Record<string, BaseModel[]>,
    C extends BaseModel
> = ModelChunk<M, R, S, E, H> & {
    children: ChunkOf<C>[]
}

type ListConfig<
    M extends number,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    E extends Record<string, BaseModel[]>,
    H extends Record<string, BaseModel[]>,
    C extends BaseModel
> = ModelConfig<M, R, I, S, E, H> & {
    children: C[]
}

type IListConfig<
    R extends BaseData,
    S extends BaseData,
    E extends Record<string, BaseModel[]>,
    H extends Record<string, BaseModel[]>,
    C extends BaseModel
> = IModelConfig<R, S, E, H> & {
    children?: C[]
}

type PureListConfig<
    C extends BaseModel
> = {
    app: App;
    referId?: string;
    children: C[]
}

export {
    ListChunk,
    ListConfig,
    IListConfig,
    PureListConfig
};