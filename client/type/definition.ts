import { IBase } from ".";
import type { Model } from "../models";
import type { ModelCode } from "./registry";

/** 基础模型定义 */
export type BaseModelDef = {
    code: ModelCode
    preset: IBase.Data
    state: IBase.Data
    parent: Model | undefined
    eventDict: IBase.Dict,
    childDefList: Array<BaseModelDef>
    childDefDict: Record<IBase.Key, BaseModelDef>,
    computerDefDict: Record<IBase.Key, BaseModelDef>
    observerDefDict: Record<IBase.Key, BaseModelDef>
    producerDefDict: Record<IBase.Key, BaseModelDef>
}

export type CommonModelDef<M extends Partial<BaseModelDef>> = M & Omit<BaseModelDef, keyof M>
export type CustomModelDef<M extends Partial<BaseModelDef>> = M & Omit<{
    code: never,
    preset: {},
    state: {}
    parent: Model | undefined
    eventDict: {},
    childDefList: []
    childDefDict: {}
    computerDefDict: {}
    observerDefDict: {}
    producerDefDict: {}
}, keyof M>

export type BunnyModelDef = CustomModelDef<{
    code: ModelCode.Bunny,
    state: {
        age: number,
        weight: number,
        maxAge: number,
    },
    childDefDict: {
        forager: ForagerModelDef,
    },
    computerDefDict: {
        time: TimerModelDef,
    },
    producerDefDict: {
        tickDone: TimerModelDef,
    },
}>

export type RootModelDef = CustomModelDef<{
    code: ModelCode.Root,
    state: {
        progress: number,
    }
    childDefDict: {
        time: TimerModelDef,
    }
    childDefList: BunnyModelDef[],
}>

export type TimerModelDef = CustomModelDef<{
    code: ModelCode.Time,
    state: {
        time: number,
    },
    eventDict: {
        tickBefore: void,
        tickDone: void,
    }
}>

export type ForagerModelDef = CustomModelDef<{
    code: ModelCode.Forager,
    state: {
        energy: number,
        maxEnergy: number,
        energyWaste: number,
    },
    producerDefDict: {
        tickDone: TimerModelDef,
    }
}>

