import { KeyOf, ValueOf } from ".";
import type { App } from "../app";
import { Model } from "../models";
import { ModelRegistry } from "../services/factory";
import { ModelTmpl } from "./model-tmpl";

// 模型层节点定义
export namespace ModelType {
    // 反序列化参数
    export type PureConfig<
        M extends ModelTmpl
    > = Readonly<{
        id?: string
        code: ModelTmpl.Code<M>
        info?: Partial<ModelTmpl.Info<M>>
        childList?: ModelType.ChildConfigList<M>,
        childDict?: Partial<ModelType.ChildConfigDict<M>>,
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
        id?: string,
        app: App,
        code: ModelTmpl.Code<M>,
        info: ModelTmpl.Info<M>,
        parent: ModelTmpl.Parent<M>,
        childList?: ModelType.ChildConfigList<M>,
        childDict: ModelType.ChildConfigDict<M>,
    }

    // 序列化参数
    export type Bundle<
        M extends ModelTmpl
    > = {
        id: string;
        code: ModelTmpl.Code<M>,
        info: ModelTmpl.Info<M>,
        childList: ModelType.ChildBundleList<M>,   
        childDict: ModelType.ChildBundleDict<M>,
    }

    
    export type Spec<M extends ModelTmpl> = 
        InstanceType<ModelRegistry[ModelTmpl.Code<M>]>

    // 子节点字典/列表
    export type ChildDict<M extends ModelTmpl> = {
        [K in KeyOf<ModelTmpl.ChildDict<M>>]: 
            Model<ModelTmpl.ChildDict<M>[K]>
    }
    export type SpecChildDict<M extends ModelTmpl> = {
        [K in KeyOf<ModelTmpl.ChildDict<M>>]: 
            ModelType.Spec<ModelTmpl.ChildDict<M>[K]>
    }

    export type ChildList<M extends ModelTmpl> = Array<
        Model<ValueOf<ModelTmpl.ChildList<M>>>
    >
    export type SpecChildList<M extends ModelTmpl> = Array<
        ModelType.Spec<ValueOf<ModelTmpl.ChildList<M>>>
    >

    // 子节点反序列化参数
    export type ChildBundleDict<M extends ModelTmpl> = {
        [K in KeyOf<ModelTmpl.ChildDict<M>>]:
            ModelType.Bundle<ModelTmpl.ChildDict<M>[K]>
    }
    export type ChildBundleList<M extends ModelTmpl> = Array<
        ModelType.Bundle<ValueOf<ModelTmpl.ChildList<M>>>
    >

    // 子节点序列化参数
    export type ChildConfigDict<M extends ModelTmpl> = {
        [K in KeyOf<ModelTmpl.ChildDict<M>>]: 
            ModelType.PureConfig<ModelTmpl.ChildDict<M>[K]>
    }
    export type ChildConfigList<M extends ModelTmpl> = Array<
        ModelType.PureConfig<ValueOf<ModelTmpl.ChildList<M>>>
    >
    
}