import type { Model } from "../models";
import { IBase } from ".";
import type { IModel } from "./model";

/** 模型定义 */
export type ModelTmpl = {
    code: string
    rule: IBase.Data
    state: IBase.Data
    childList: Array<Model>
    childDict: Record<IBase.Key, Model>,
    parent: Model | undefined
    emitterEventDict: IModel.BaseEmitterEventDict
    handlerEventDict: IBase.Dict
}

export type SpecificModelTmpl<M extends Partial<ModelTmpl>> = 
    M & Omit<{
        code: never,
        rule: IBase.VoidDict,
        state: IBase.VoidDict
        childList: Array<never>
        childDict: IBase.VoidDict
        parent: Model | undefined
        emitterEventDict: IModel.BaseEmitterEventDict
        handlerEventDict: IBase.VoidDict
    }, keyof M>
