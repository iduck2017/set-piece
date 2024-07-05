import type { App } from "../app";
import type { Model } from "../models/base";
import { BaseData, BaseEvent } from "./base";
import { CheckBeforeEvent, EventId, UpdateDoneEvent } from "./events";

type BaseModel = Model<
    number,
    BaseEvent,
    BaseEvent,
    BaseData,
    BaseData,
    BaseData,
    BaseModel | App
>;

type ModelEvent<
    E extends BaseEvent
> = E & {
    [EventId.CHECK_BEFORE]: CheckBeforeEvent, 
    [EventId.UPDATE_DONE]: UpdateDoneEvent,
}

type ModelChunk<
    M extends number,
    E extends BaseEvent,
    H extends BaseEvent,
    R extends BaseData,
    S extends BaseData,
> = {
    referId: string,
    modelId: M,
    rule: R,
    stat: S,
    provider: { [K in keyof E]?: string[] }
    consumer: { [K in keyof H]?: string[] }
}

type ModelConfig<
    M extends number,
    E extends BaseEvent,
    H extends BaseEvent,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
> = {
    referId?: string
    modelId: M
    rule: R
    info: I
    stat: S
    provider: { [K in keyof E]?: string[] }
    consumer: { [K in keyof H]?: string[] }
}

type IModelConfig<
    E extends BaseEvent,
    H extends BaseEvent,
    R extends BaseData,
    S extends BaseData,
> = {
    referId?: string;
    rule: R;
    stat?: Partial<S>
    provider?: { [K in keyof E]?: string[] }
    consumer?: { [K in keyof H]?: string[] }
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