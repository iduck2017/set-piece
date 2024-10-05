import { Base, Override } from ".";
import type { App } from "../app";
import type { Model } from "../models";
import { ModelCode } from "../services/factory";

// 模型层节点定义
export type ModelTmpl = {
    code: ModelCode
    stableInfo: Base.Data
    labileInfo: Base.Data
    childList: Array<ModelTmpl>
    childDict: Record<Base.Key, ModelTmpl>,
    parent: Model | App;
    signalDict: Base.Dict,
    effectDict: Base.Dict,
}

export namespace ModelTmpl {
    // 基础参数反射
    export type Code<M extends ModelTmpl> = M['code']
    export type StableInfo<M extends ModelTmpl> = M['stableInfo']
    export type LabileInfo<M extends ModelTmpl> = M['labileInfo']
    export type ChildDict<M extends ModelTmpl> = M['childDict']
    export type ChildList<M extends ModelTmpl> = M['childList']
    export type SignalDict<M extends ModelTmpl> = M['signalDict']
    export type EffectDict<M extends ModelTmpl> = M['effectDict']
    export type Parent<M extends ModelTmpl> = M['parent']
    export type Info<M extends ModelTmpl> = M['labileInfo'] & M['stableInfo']
}

// 自定义模型层节点定义
export type SpecModelTmpl<
    M extends Partial<ModelTmpl>
> = Readonly<Override<{
    // 空模型层节点定义
    code: never,
    stableInfo: Base.VoidData,
    labileInfo: Base.VoidData,
    childList: Base.VoidList,
    childDict: Base.VoidData
    signalDict: Base.VoidData,
    effectDict: Base.VoidData,
    parent: Model
}, M>>
