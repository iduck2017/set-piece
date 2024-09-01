import { IBase } from ".";
import type { Model } from "../models";
import type { ModelType } from "./model";
import type { ModelCode } from "./registry";

/** 基础模型定义 */
export type BaseModelDef = {
    code: ModelCode
    preset: IBase.Data
    state: IBase.Data
    childList: Array<BaseModelDef>
    childDict: Record<IBase.Key, BaseModelDef>,
    parent: Model | undefined
    emitterEventDict: ModelType.BaseEmitterEventDict
    handlerEventDict: IBase.Dict
}

export type CustomModelDef<M extends Partial<BaseModelDef>> = M & Omit<{
    code: never,
    preset: IBase.VoidDict,
    state: IBase.VoidDict
    childList: Array<never>
    childDict: IBase.VoidDict
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
        timeUpdateDone: void,
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
        timeUpdateBefore: void,
        timeUpdateDone: void,
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
        timeUpdateDone: void,
    }
}>

