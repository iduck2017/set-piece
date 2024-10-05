import { KeyOf, ValueOf } from ".";
import type { App } from "../app";
import { PureModel } from "../models";
import { ModelRegistry } from "../services/factory";
import { ModelDef } from "./model-def";

// 模型层节点定义
export namespace ModelType {
    // 反序列化参数
    export type PureConfig<
        M extends ModelDef
    > = Readonly<{
        code: ModelDef.Code<M>
        id?: string
        presetInfo?: Partial<ModelDef.StableInfo<M>>
        labileInfo?: Partial<ModelDef.LabileInfo<M>>
        childList?: ModelType.ConfigList<M>,
        childDict?: Partial<ModelType.ConfigDict<M>>,
    }>

    // 自定义初始化参数
    export type Config<
        M extends ModelDef
    > = Readonly<{
        app: App,
        parent: ModelDef.Parent<M>
    }> & PureConfig<M>

    // 模基类初始化参数
    export type BaseConfig<
        M extends ModelDef
    > = {
        app: App,
        code: ModelDef.Code<M>,
        id?: string,
        presetInfo?: Partial<ModelDef.StableInfo<M>>
        stableInfo: ModelDef.StableInfo<M>,
        labileInfo: ModelDef.LabileInfo<M>,
        parent: ModelDef.Parent<M>,
        childList?: ModelType.ConfigList<M>,
        childDict: ModelType.ConfigDict<M>,
    }

    // 序列化参数
    export type Bundle<
        M extends ModelDef
    > = {
        code: ModelDef.Code<M>,
        id: string;
        presetInfo?: Partial<ModelDef.StableInfo<M>>
        labileInfo: ModelDef.LabileInfo<M>,
        childList: ModelType.BundleList<M>,   
        childDict: ModelType.BundleDict<M>,
    }

    // 子节点字典/列表
    export type Dict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]: 
            PureModel<ModelDef.ChildDict<M>[K]>
    }
    export type List<M extends ModelDef> = Array<
        PureModel<ValueOf<ModelDef.ChildList<M>>>
    >

    export type Spec<M extends ModelDef> = 
        InstanceType<ModelRegistry[ModelDef.Code<M>]>
    export type SpecDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]: 
            ModelType.Spec<ModelDef.ChildDict<M>[K]> | undefined
    }
    export type SpecList<M extends ModelDef> = Array<
        ModelType.Spec<ValueOf<ModelDef.ChildList<M>>> | undefined
    >

    // 子节点反序列化参数
    export type BundleDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]:
            ModelType.Bundle<ModelDef.ChildDict<M>[K]>
    }
    export type BundleList<M extends ModelDef> = Array<
        ModelType.Bundle<ValueOf<ModelDef.ChildList<M>>>
    >

    // 子节点序列化参数
    export type ConfigDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]: 
            ModelType.PureConfig<ModelDef.ChildDict<M>[K]>
    }
    export type ConfigList<M extends ModelDef> = Array<
        ModelType.PureConfig<ValueOf<ModelDef.ChildList<M>>>
    >
    
}