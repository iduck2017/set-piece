import type { Model } from "../models";
import { Base } from ".";
import type { ModelType } from "./model";

/** 模型定义 */
export type ModelTmpl = {
    code: string
    rule: Base.Data
    state: Base.Data
    childList: Array<Model>
    childDict: Record<Base.Key, Model>,
    parent: Model | undefined
    emitterEventDict: ModelType.BaseEmitterEventDict
    handlerEventDict: Base.Dict
}

export type SpecificModelTmpl<M extends Partial<ModelTmpl>> = 
    M & Omit<{
        code: never,
        rule: Base.VoidDict,
        state: Base.VoidDict
        childList: Array<never>
        childDict: Base.VoidDict
        parent: Model | undefined
        emitterEventDict: ModelType.BaseEmitterEventDict
        handlerEventDict: Base.VoidDict
    }, keyof M>
