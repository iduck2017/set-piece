import { IBase } from ".";
import type { Model } from "../models";
import type { ModelDecl } from "./model";
import type { ModelCode } from "./registry";

/** 模型定义 */
export namespace IModelDef {
    /** 基础模型定义 */
    export type Base = {
        code: ModelCode
        preset: IBase.Data
        state: IBase.Data
        childList: Array<Base>
        childDict: Record<IBase.Key, Base>,
        parent: Model | undefined
        emitterEventDict: ModelDecl.BaseEmitterEventDict
        handlerEventDict: IBase.Dict
    }

    export type Common<M extends Partial<Base>> = M & Omit<{
        code: never,
        preset: IBase.VoidDict,
        state: IBase.VoidDict
        childList: Array<never>
        childDict: IBase.VoidDict
        parent: Model | undefined
        emitterEventDict: ModelDecl.BaseEmitterEventDict
        handlerEventDict: {}
    }, keyof M>

    export type Bunny = Common<{
        code: ModelCode.Bunny,
        state: {
            age: number,
            weight: number,
            maxAge: number,
        },
        childDict: {
            forager: Forager,
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
            time: Time,
        }
        childList: Bunny[],
    }>
    
    export type Time = Common<{
        code: ModelCode.Time,
        state: {
            time: number,
        },
        emitterEventDict: ModelDecl.BaseEmitterEventDict & {
            timeUpdateBefore: void,
            timeUpdateDone: void,
        }
    }>

    export type Forager = Common<{
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
}


