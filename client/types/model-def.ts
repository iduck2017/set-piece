import { Base, Override } from ".";
import type { Model } from "../models";

// 模型层节点定义
export type ModelDef = {
    code: string
    info: Base.Data
    intf: Record<Base.Key, Base.Function>
    childList: Array<ModelDef>
    childDict: Record<Base.Key, ModelDef>,
    eventDict: Base.Dict,
    reactDict: Base.Dict,
    parent: Model | undefined;
}

export namespace ModelDef {
    // 基础参数反射
    export type Code<M extends ModelDef> = M['code']
    export type Info<M extends ModelDef> = M['info']
    export type Intf<M extends ModelDef> = M['intf']
    export type Parent<M extends ModelDef> = M['parent']
    export type ChildDict<M extends ModelDef> = Required<M['childDict']>
    export type ChildList<M extends ModelDef> = M['childList']
    export type EventDict<M extends ModelDef> = M['eventDict']
    export type ReactDict<M extends ModelDef> = M['reactDict']
}

// 自定义模型层节点定义
export type TmplModelDef<
    M extends Partial<ModelDef>
> = Readonly<Override<M, {
    // 空模型层节点定义
    code: never,
    info: Base.VoidData,
    intf: Base.VoidData,
    parent: Model | undefined,
    childList: Base.VoidList,
    childDict: Base.VoidData
    eventDict: Base.VoidData,
    reactDict: Base.VoidData,
}>>

