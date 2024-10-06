import { KeyOf, ValueOf } from ".";
import type { App } from "../app";
import type { Model } from "../models";
import { ModelRegistry } from "../services/factory";
import { ModelDef } from "./model-def";

export type PureModelConfig<
    M extends ModelDef
> = Readonly<{
    id?: string
    code: ModelDef.Code<M>
    info?: Partial<ModelDef.Info<M>>
    childList?: ModelType.ChildConfigList<M>,
    childDict?: Partial<ModelType.ChildConfigDict<M>>,
}>

export type ModelConfig<M extends ModelDef> =  
    PureModelConfig<M> &
    Readonly<{
        app: App,
        parent: ModelDef.Parent<M>
    }>

// 模型层节点定义
export namespace ModelType {
    // 模基类初始化参数
    export type BaseConfig<
        M extends ModelDef
    > = {
        id?: string,
        app: App,
        code: ModelDef.Code<M>,
        info: ModelDef.Info<M>,
        parent: ModelDef.Parent<M>,
        childList?: ModelType.ChildConfigList<M>,
        childDict: ModelType.ChildConfigDict<M>,
    }

    // 序列化参数
    export type Bundle<
        M extends ModelDef
    > = {
        id: string;
        code: ModelDef.Code<M>,
        info: ModelDef.Info<M>,
        childList: ModelType.ChildBundleList<M>,   
        childDict: ModelType.ChildBundleDict<M>,
    }

    
    export type Spec<M extends ModelDef> = 
        InstanceType<ModelRegistry[ModelDef.Code<M>]>

    // 子节点字典/列表
    export type ChildDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]: 
            Model<ModelDef.ChildDict<M>[K]>
    }
    export type SpecChildDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]: 
            ModelType.Spec<ModelDef.ChildDict<M>[K]>
    }

    export type ChildList<M extends ModelDef> = Array<
        Model<ValueOf<ModelDef.ChildList<M>>>
    >
    export type SpecChildList<M extends ModelDef> = Array<
        ModelType.Spec<ValueOf<ModelDef.ChildList<M>>>
    >

    // 子节点反序列化参数
    export type ChildBundleDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]:
            ModelType.Bundle<ModelDef.ChildDict<M>[K]>
    }
    export type ChildBundleList<M extends ModelDef> = Array<
        ModelType.Bundle<ValueOf<ModelDef.ChildList<M>>>
    >

    // 子节点序列化参数
    export type ChildConfigDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]: 
            PureModelConfig<ModelDef.ChildDict<M>[K]>
    }
    export type ChildConfigList<M extends ModelDef> = Array<
        PureModelConfig<ValueOf<ModelDef.ChildList<M>>>
    >
    
}