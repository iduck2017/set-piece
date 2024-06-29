import type { App } from "../app";
import { BaseData } from "./base";
import { ChunkOf } from "./common";
import { BaseModel, IModelConfig, ModelChunk, ModelConfig } from "./model";

type DictChunk<
    M extends number,
    R extends BaseData,
    S extends BaseData,
    E extends Record<string, BaseModel[]>,
    H extends Record<string, BaseModel[]>,
    C extends Record<string, BaseModel>
> = ModelChunk<M, R, S, E, H> & {
    children: {
        [K in keyof C]: ChunkOf<C[K]>
    }
}

type DictConfig<
    M extends number,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    E extends Record<string, BaseModel[]>,
    H extends Record<string, BaseModel[]>,
    C extends Record<string, BaseModel>
> = ModelConfig<M, R, I, S, E, H> & {
    children: C
}

type IDictConfig<
    R extends BaseData,
    S extends BaseData,
    E extends Record<string, BaseModel[]>,
    H extends Record<string, BaseModel[]>,
    C extends Record<string, BaseModel>
> = IModelConfig<R, S, E, H> & {
    children?: Partial<C>
}


type PureDictConfig<
    C extends Record<string, BaseModel>
> = {
    app: App;
    referId?: string;
    children: C
}

export {
    DictChunk,
    DictConfig,
    IDictConfig,
    PureDictConfig
};