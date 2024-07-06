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
    BaseModel,
    BaseModel[],
    Record<string, BaseModel>
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
    L extends BaseModel[],
    D extends Record<string, BaseModel>
> = {
    referId: string,
    modelId: M,
    rule: R,
    stat: S,
    list: ChunkOf<L[number]>[],
    dict: { [K in keyof D]: ChunkOf<D[K]> }
    provider: { [K in keyof ModelEvent<E>]?: string[] }
    consumer: { [K in keyof H]?: string[] },
}

type ModelConfig<
    M extends number,
    E extends BaseEvent,
    H extends BaseEvent,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    L extends BaseModel[],
    D extends Record<string, BaseModel>
> = {
    referId?: string
    modelId: M
    rule: R
    info: I
    stat: S
    dict: D
    list: L,
    consumer: { [K in keyof H]?: string[] }
    provider: { [K in keyof ModelEvent<E>]?: string[] }
}

type ModelTemplate<
    E extends BaseEvent,
    H extends BaseEvent,
    R extends BaseData,
    S extends BaseData,
    L extends BaseModel[],
    D extends Record<string, BaseModel>
> = {
    referId?: string;
    rule: R;
    stat?: Partial<S>
    list?: L,
    dict?: Partial<D>
    provider?: { [K in keyof ModelEvent<E>]?: string[] }
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
    ModelTemplate,

    ChunkOf
};