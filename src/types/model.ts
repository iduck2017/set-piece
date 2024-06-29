import type { App } from "../app";
import type { Model } from "../models/base";
import { BaseData, VoidData } from "./base";

type BaseModel = Model<
    number,
    BaseData,
    BaseData,
    BaseData,
    VoidData,
    VoidData,
    BaseModel | App
>;

type ModelRefer = {
    updateDone?: BaseModel[];
    checkBefore?: BaseModel[];
}

type ModelChunk<
    M extends number,
    R extends BaseData,
    S extends BaseData,
    E extends Record<string, BaseModel[]>,
    H extends Record<string, BaseModel[]>,
> = {
    referId: string,
    modelId: M,
    rule: R,
    state: S,
    emitters: Record<keyof (E & ModelRefer), string[]>
    handlers: Record<keyof (H & ModelRefer), string[]>
}

type ModelConfig<
    M extends number,
    R extends BaseData,
    I extends BaseData,
    S extends BaseData,
    E extends Record<string, BaseModel[]>,
    H extends Record<string, BaseModel[]>,
> = {
    app: App
    referId?: string
    modelId: M
    rule: R
    info: I
    state: S
    emitters: Record<keyof (E & ModelRefer), string[]>
    handlers: Record<keyof (H & ModelRefer), string[]>
}

type IModelConfig<
    R extends BaseData,
    S extends BaseData,
    E extends Record<string, BaseModel[]>,
    H extends Record<string, BaseModel[]>,
> = R extends VoidData ? {
    app: App;
    referId?: string;
    state?: Partial<S>;
    emitters?: Record<keyof (E & ModelRefer), string[]>
    handlers?: Record<keyof (H & ModelRefer), string[]>
} : {
    app: App;
    referId?: string;
    rule: R;
    state?: Partial<S>;
    emitters: Record<keyof (E & ModelRefer), string[]>
    handlers: Record<keyof (H & ModelRefer), string[]>
}

export {
    BaseModel,
    ModelRefer,
    ModelChunk,
    ModelConfig,
    IModelConfig
};