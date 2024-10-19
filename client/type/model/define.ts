import { Base, KeyOf } from "..";
import type { Model } from "../../models";

// 模型定义
export type ModelDef = Readonly<{
    code: string
    info: Base.Data
    intf: Record<Base.Key, Base.Function>
    childList: Array<ModelDef>
    childDict: Record<Base.Key, ModelDef>,
    eventDict: Base.Dict,
    reactDict: Base.Dict,
    parent: Model | undefined;
}>

// 模型定义反射
export namespace ModelDef {
    export type Code<M extends ModelDef> = M['code']
    export type Info<M extends ModelDef> = M['info']
    export type Intf<M extends ModelDef> = M['intf']
    export type Parent<M extends ModelDef> = M['parent']
    export type ChildList<M extends ModelDef> = M['childList']
    export type ChildDict<M extends ModelDef> = Required<M['childDict']>
    export type EventDict<M extends ModelDef> = Required<M['eventDict']>
    export type ReactDict<M extends ModelDef> = Required<M['reactDict']>
}

// 泛型模型定义
export type TmplModelDef<
    D extends Partial<ModelDef>
> = Omit<{
    code: never,
    info: Base.VoidData,
    intf: Base.VoidData,
    parent: Model | undefined,
    childList: Base.VoidList,
    childDict: Base.VoidData
    eventDict: Base.VoidData,
    reactDict: Base.VoidData,
}, KeyOf<D>> & D
