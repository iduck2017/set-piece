import { Base, KeyOf } from "..";

// 模型定义
export type ModelDef = Readonly<{
    code: string
    state: Base.Data
    childList: Array<ModelDef>
    childDict: Record<Base.Key, ModelDef>,
    signalDict: Base.Dict,
    effectDict: Base.Dict,
    actionDict: Record<Base.Key, Base.Function>
    parent: ModelDef | undefined;
}>

// 模型定义反射
export namespace ModelDef {
    export type Code<M extends ModelDef> = M['code']
    export type State<M extends ModelDef> = M['state']
    export type ChildList<M extends ModelDef> = M['childList']
    export type ChildDict<M extends ModelDef> = Required<M['childDict']>
    export type SignalDict<M extends ModelDef> = Required<M['signalDict']>
    export type EffectDict<M extends ModelDef> = Required<M['effectDict']>
    export type ActionDict<M extends ModelDef> = M['actionDict']
    export type Parent<M extends ModelDef> = M['parent']
}

// 泛型模型定义
export type TmplModelDef<
    D extends Partial<ModelDef>
> = Omit<{
    code: never,
    state: Base.VoidData,
    childList: Base.VoidList,
    childDict: Base.VoidData
    signalDict: Base.VoidData,
    effectDict: Base.VoidData,
    actionDict: Base.VoidData,
    parent: ModelDef,
}, KeyOf<D>> & D
