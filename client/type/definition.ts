import { IBase } from ".";
import type { Model } from "../models";
import type { BunnyModel } from "../models/bunny";
import type { TimeModel } from "../models/time";
import { IModel } from "./model";

/** 模型定义 */
export enum ModelKey {
    Code = 'code',
    State = 'state',
    Preset = 'preset',
    Parent = 'parent',
    ChildList = 'childList',
    ChildDict = 'childDict',
    EmitterEventDict = 'emitterEventDict',
    HandlerEventDict = 'handlerEventDict'
}

/** 模型注册表 */
export enum ModelCode {
    Bunny = 'bunny',
    Root = 'root',
    Time = 'time'
}

/** 模型定义 */
export namespace IModelDef {
    /** 基础模型定义 */
    export type Base = {
        code: ModelCode
        preset: IBase.Data
        state: IBase.Data
        childList: Array<Model>
        childDict: Record<IBase.Key, Model>,
        parent: Model | undefined
        emitterEventDict: IModel.BaseEmitterEventDict
        handlerEventDict: IBase.Dict
    }

    export type Common<M extends Partial<Base>> = 
        M & Omit<{
            code: never,
            preset: IBase.VoidDict,
            state: IBase.VoidDict
            childList: Array<never>
            childDict: IBase.VoidDict
            parent: Model | undefined
            emitterEventDict: IModel.BaseEmitterEventDict
            handlerEventDict: IBase.VoidDict
        }, keyof M>

    export type Bunny = Common<{
        code: ModelCode.Bunny,
        state: {
            age: number,
            weight: number,
            maxAge: number,
        },
        handlerEventDict: {
            timeUpdateDone: void,
        }
    }>

    export type Root = Common<{
        code: ModelCode.Root,
        state: {
            progress: number,
        }
        childDict: {
            time: TimeModel,
        }
        childList: BunnyModel[],
    }>
    
    export type Time = Common<{
        code: ModelCode.Time,
        state: {
            time: number,
        },
        emitterEventDict: IModel.BaseEmitterEventDict & {
            timeUpdateBefore: void,
            timeUpdateDone: void
        }
    }>
}


