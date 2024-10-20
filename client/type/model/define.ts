import { Base, KeyOf } from "..";
import type { Model } from "../../model";

// 模型定义
export type ModelDef = Readonly<{
    code: string
    info: Base.Data
    childList: Array<ModelDef>
    childDict: Record<Base.Key, ModelDef>,
    eventDict: Base.Dict,
    effectDict: Base.Dict,
    methodDict: Record<Base.Key, Base.Function>
    parent: Model | undefined;
}>

// 模型定义反射
export namespace ModelDef {
    export type Code<M extends ModelDef> = M['code']
    export type Info<M extends ModelDef> = M['info']
    export type Parent<M extends ModelDef> = M['parent']
    export type ChildList<M extends ModelDef> = M['childList']
    export type ChildDict<M extends ModelDef> = Required<M['childDict']>
    export type EventDict<M extends ModelDef> = Required<M['eventDict']>
    export type EffectDict<M extends ModelDef> = Required<M['effectDict']>
    export type MethodDict<M extends ModelDef> = M['methodDict']
}

// 泛型模型定义
export type TmplModelDef<
    D extends Partial<ModelDef>
> = Omit<{
    code: never,
    info: Base.VoidData,
    parent: Model | undefined,
    childList: Base.VoidList,
    childDict: Base.VoidData
    eventDict: Base.VoidData,
    effectDict: Base.VoidData,
    methodDict: Base.VoidData,
}, KeyOf<D>> & D
