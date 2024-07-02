import type { App } from "../app";
import { BaseData } from "./base";
import { EventId } from "./events";
import { 
    BaseModel, 
    ChunkOf, 
    IModelConfig, 
    ModelChunk, 
    ModelConfig 
} from "./model";
import { ModelId } from "./registry";

type DictChunk<
    M extends number,
    E extends EventId,
    H extends EventId,
    R extends BaseData,
    S extends BaseData,
    C extends Record<string, BaseModel>
> = ModelChunk<M, E, H, R, S> & {
    children: {
        [K in keyof C]: ChunkOf<C[K]>
    }
}

type DictConfig<
    M extends number,
    E extends EventId,
    H extends EventId,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    C extends Record<string, BaseModel>
> = ModelConfig<M, E, H, R, I, S> & {
    children: C
}

type IDictConfig<
    E extends EventId,
    H extends EventId,
    R extends BaseData,
    S extends BaseData,
    C extends Record<string, BaseModel>
> = IModelConfig<E, H, R, S> & {
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