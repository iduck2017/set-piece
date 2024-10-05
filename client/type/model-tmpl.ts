import { Base, Override } from ".";
import type { App } from "../app";
import type { Model } from "../models";
import type { ModelCode } from "../services/factory";

// 模型层节点定义
export type ModelTmpl = {
    code: ModelCode
    info: Base.Data
    parent: Model | App;
    childList: Array<ModelTmpl>
    childDict: Record<Base.Key, ModelTmpl>,
    eventDict: Base.Dict,
    reactDict: Base.Dict,
}

export namespace ModelTmpl {
    // 基础参数反射
    export type Code<M extends ModelTmpl> = M['code']
    export type Info<M extends ModelTmpl> = M['info']
    export type Parent<M extends ModelTmpl> = M['parent']
    export type ChildDict<M extends ModelTmpl> = M['childDict']
    export type ChildList<M extends ModelTmpl> = M['childList']
    export type EventDict<M extends ModelTmpl> = M['eventDict']
    export type ReactDict<M extends ModelTmpl> = M['reactDict']
}

// 自定义模型层节点定义
export type SpecModelTmpl<
    M extends Partial<ModelTmpl>
> = Readonly<Override<{
    // 空模型层节点定义
    code: never,
    info: Base.VoidData,
    parent: Model,
    childList: Base.VoidList,
    childDict: Base.VoidData
    eventDict: Base.VoidData,
    reactDict: Base.VoidData,
}, M>>
