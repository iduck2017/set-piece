import { IBase } from ".";
import type { Model } from "../models";
import { IModel } from "./model";
import type { ModelCode } from "./registry";

/** 基础模型定义 */
/**
 * effector
 * effected
 * 
 * computer
 * computed
 * 
 * modifier
 * modified
 * 
 */
export type BaseModelDef = {
    code: ModelCode
    parent?: Model
    preset: IBase.Data
    state: IBase.Data
    childDefList: Array<BaseModelDef>
    childDefDict: Record<IBase.Key, BaseModelDef>,
    eventDict: IBase.Dict,
    effecterDefDict: Record<IBase.Key, BaseModelDef>,
    computerDefDict: Record<IBase.Key, BaseModelDef>,
    modifierDefDict: Record<IBase.Key, BaseModelDef>,
}

export type CommonModelDef<M extends Partial<BaseModelDef>> = M & Omit<BaseModelDef, keyof M>
export type CustomModelDef<M extends Partial<BaseModelDef>> = M & Omit<{
    code: never,
    preset: {},
    state: {}
    parent?: Model
    childDefList: []
    childDefDict: {}
    effectBodyDict: {}
    effectReqDefDict: {}
    updateReqDefDict: {}
    reduceReqDefDict: {}
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
    reqDefDict: {
        effect: {
            tickDone: TimerModelDef,
        },
        update: {
            time: TimerModelDef,
        },
        reduce: {}
    }
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
    effectDict: {
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
    reqDefDict: {
        effect: {
            tickDone: TimerModelDef,
        },
        reduce: {},
        update: {}
    }
}>

