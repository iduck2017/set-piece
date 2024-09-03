import { IBase } from ".";
import type { Model } from "../models";
import type { EventType } from "./event";
import type { ModelType } from "./model";
import type { ModelCode } from "./registry";

/** 基础模型定义 */
export type BaseModelDef = {
    code: ModelCode
    preset: IBase.Data
    state: IBase.Data
    childList: Array<BaseModelDef>
    childDict: Record<string, BaseModelDef>,
    parent: Model | undefined
    emitterEventDict: ModelType.BaseEmitterEventDict
    handlerEventDict: IBase.Dict
}

export type CommonModelDef<M extends Partial<BaseModelDef>> = M & Omit<BaseModelDef, keyof M>
export type CustomModelDef<M extends Partial<BaseModelDef>> = M & Omit<{
    code: never,
    preset: {},
    state: {}
    childList: Array<never>
    childDict: {}
    parent: Model | undefined
    emitterEventDict: ModelType.BaseEmitterEventDict
    handlerEventDict: {}
}, keyof M>

export type BunnyModelDef = CustomModelDef<{
    code: ModelCode.Bunny,
    state: {
        age: number,
        weight: number,
        maxAge: number,
    },
    childDict: {
        forager: ForagerModelDef,
    },
    handlerEventDict: {
        timeTickDone: void,
        timeUpdateBefore: EventType.StateUpdateBefore<TimerModelDef>,
    }
}>

export type RootModelDef = CustomModelDef<{
    code: ModelCode.Root,
    state: {
        progress: number,
    }
    childDict: {
        time: TimerModelDef,
    }
    childList: BunnyModelDef[],
}>

export type TimerModelDef = CustomModelDef<{
    code: ModelCode.Time,
    state: {
        time: number,
    },
    emitterEventDict: ModelType.BaseEmitterEventDict & {
        timeTickBefore: void,
        timeTickDone: void,
    }
}>

export type ForagerModelDef = CustomModelDef<{
    code: ModelCode.Forager,
    state: {
        energy: number,
        maxEnergy: number,
        energyWaste: number,
    },
    handlerEventDict: {
        timeTickDone: void,
    }
}>

