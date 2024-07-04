import type { App } from "../app";
import { BaseData, BaseEvent } from "./base";
import { EventId } from "./events";
import { 
    BaseModel, 
    ChunkOf, 
    IModelConfig, 
    ModelChunk, 
    ModelConfig 
} from "./model";

type DictChunk<
    M extends number,
    E extends BaseEvent,
    H extends BaseEvent,
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
    E extends BaseEvent,
    H extends BaseEvent,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    C extends Record<string, BaseModel>
> = ModelConfig<M, E, H, R, I, S> & {
    children: C
}

type IDictConfig<
    E extends BaseEvent,
    H extends BaseEvent,
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