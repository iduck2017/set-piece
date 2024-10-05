import { KeyOf, ValueOf } from ".";
import type { App } from "../app";
import { PureModel } from "../models";
import { ModelRegistry } from "../services/factory";
import { ModelTmpl } from "./model-def";

// 模型层节点定义
export namespace ModelType {
    // 反序列化参数
    export type PureConfig<
        M extends ModelTmpl
    > = Readonly<{
        code: ModelTmpl.Code<M>
        id?: string
        presetInfo?: Partial<ModelTmpl.StableInfo<M>>
        labileInfo?: Partial<ModelTmpl.LabileInfo<M>>
        childList?: ModelType.ConfigList<M>,
        childDict?: Partial<ModelType.ConfigDict<M>>,
    }>

    // 自定义初始化参数
    export type Config<
        M extends ModelTmpl
    > = Readonly<{
        app: App,
        parent: ModelTmpl.Parent<M>
    }> & PureConfig<M>

    // 模基类初始化参数
    export type BaseConfig<
        M extends ModelTmpl
    > = {
        app: App,
        code: ModelTmpl.Code<M>,
        id?: string,
        presetInfo?: Partial<ModelTmpl.StableInfo<M>>
        stableInfo: ModelTmpl.StableInfo<M>,
        labileInfo: ModelTmpl.LabileInfo<M>,
        parent: ModelTmpl.Parent<M>,
        childList?: ModelType.ConfigList<M>,
        childDict: ModelType.ConfigDict<M>,
    }

    // 序列化参数
    export type Bundle<
        M extends ModelTmpl
    > = {
        code: ModelTmpl.Code<M>,
        id: string;
        presetInfo?: Partial<ModelTmpl.StableInfo<M>>
        labileInfo: ModelTmpl.LabileInfo<M>,
        childList: ModelType.BundleList<M>,   
        childDict: ModelType.BundleDict<M>,
    }

    // 子节点字典/列表
    export type Dict<M extends ModelTmpl> = {
        [K in KeyOf<ModelTmpl.ChildDict<M>>]: 
            PureModel<ModelTmpl.ChildDict<M>[K]>
    }
    export type List<M extends ModelTmpl> = Array<
        PureModel<ValueOf<ModelTmpl.ChildList<M>>>
    >

    export type Spec<M extends ModelTmpl> = 
        InstanceType<ModelRegistry[ModelTmpl.Code<M>]>
    export type SpecDict<M extends ModelTmpl> = {
        [K in KeyOf<ModelTmpl.ChildDict<M>>]: 
            ModelType.Spec<ModelTmpl.ChildDict<M>[K]> | undefined
    }
    export type SpecList<M extends ModelTmpl> = Array<
        ModelType.Spec<ValueOf<ModelTmpl.ChildList<M>>> | undefined
    >

    // 子节点反序列化参数
    export type BundleDict<M extends ModelTmpl> = {
        [K in KeyOf<ModelTmpl.ChildDict<M>>]:
            ModelType.Bundle<ModelTmpl.ChildDict<M>[K]>
    }
    export type BundleList<M extends ModelTmpl> = Array<
        ModelType.Bundle<ValueOf<ModelTmpl.ChildList<M>>>
    >

    // 子节点序列化参数
    export type ConfigDict<M extends ModelTmpl> = {
        [K in KeyOf<ModelTmpl.ChildDict<M>>]: 
            ModelType.PureConfig<ModelTmpl.ChildDict<M>[K]>
    }
    export type ConfigList<M extends ModelTmpl> = Array<
        ModelType.PureConfig<ValueOf<ModelTmpl.ChildList<M>>>
    >
    
}