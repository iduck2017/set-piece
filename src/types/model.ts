import type { App } from "../app";
import type { Model } from "../models/base";
import { BaseData } from "./base";
import { EventId } from "./events";
import { ModelId } from "./registry";

type BaseModel = Model<
    ModelId,
    never,
    never,
    BaseData,
    BaseData,
    BaseData,
    BaseModel | App
>;

type ModelEvent = 
    EventId.CHECK_BEFORE | 
    EventId.UPDATE_DONE

type ModelChunk<
    M extends ModelId,
    E extends EventId,
    H extends EventId,
    R extends BaseData,
    S extends BaseData,
> = {
    referId: string,
    modelId: M,
    rule: R,
    state: S,
    emitters: Partial<Record<E | ModelEvent, string[]>>
    handlers: Partial<Record<H | ModelEvent, string[]>>
}

type ModelConfig<
    M extends ModelId,
    E extends EventId,
    H extends EventId,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
> = {
    referId?: string
    modelId: M
    rule: R
    info: I
    state: S
    emitters: Partial<Record<E | ModelEvent, string[]>>
    handlers: Partial<Record<H | ModelEvent, string[]>>
}

type IModelConfig<
    E extends EventId,
    H extends EventId,
    R extends BaseData,
    S extends BaseData,
> = {
    referId?: string;
    rule: R;
    state?: Partial<S>
    emitters?: Partial<Record<E | ModelEvent, string[]>>
    handlers?: Partial<Record<H | ModelEvent, string[]>>
}

type ChunkOf<T extends BaseModel | undefined> = 
    T extends BaseModel ? 
    ReturnType<T['serialize']> : 
    undefined;

export {
    BaseModel,

    ModelEvent,
    ModelChunk,
    ModelConfig,
    IModelConfig,

    ChunkOf
};