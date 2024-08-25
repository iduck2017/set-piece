import type { Model } from "../models";
import { Base } from ".";

/** 模型定义 */
export type ModelTmpl = {
    code: string
    rule: Base.Data
    stableState: Base.Data
    unstableState: Base.Data
    childList: Array<Model>
    childDict: Record<Base.Key, Model>,
    parent: Model | undefined
    emitterEventDict: Record<string, Base.Dict>
    handlerEventDict: Record<string, Base.Dict>
}

export type SpecificModelTmpl<M extends Partial<ModelTmpl>> = 
    M & Omit<{
        code: never,
        rule: Base.VoidDict,
        stableState: Base.VoidDict
        unstableState: Base.VoidDict
        childList: Array<never>
        childDict: Base.VoidDict
        parent: Model | undefined
        emitterEventDict: Base.VoidDict
        handlerEventDict: Base.VoidDict
    }, keyof M>
