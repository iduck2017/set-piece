import { KeyOf, ValueOf } from ".";
import type { App } from "../app";
import type { Model } from "../models";
import { ModelDef } from "./model-def";

// 子节点初始化参数
export type ModelConfigList<M extends ModelDef> = 
    Array<PureModelConfig<ValueOf<ModelDef.ChildList<M>>>>
export type ModelConfigDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.ChildDict<M>>]: 
        ModelDef.ChildDict<M>[K] extends ModelDef ? 
            PureModelConfig<ModelDef.ChildDict<M>[K]> : 
            PureModelConfig<ModelDef.ChildDict<M>[K]> | undefined
}


export type PureModelConfig<
    M extends ModelDef
> = Readonly<{
    id?: string
    code: ModelDef.Code<M>
    info?: Partial<ModelDef.Info<M>>
    childList?: ModelConfigList<M>,
    childDict?: Partial<ModelConfigDict<M>>,
}>

export type ModelConfig<M extends ModelDef> =  
    PureModelConfig<M> &
    Readonly<{
        app: App,
        parent: ModelDef.Parent<M>
    }>

export type BaseModelConfig<
    M extends ModelDef
> = {
    id?: string,
    app: App,
    code: ModelDef.Code<M>,
    info: ModelDef.Info<M>,
    parent: ModelDef.Parent<M>,
    childList?: ModelConfigList<M>,
    childDict: ModelConfigDict<M>,
}


// 子节点序列化参数
export type ModelBundleList<M extends ModelDef> = 
    Array<ModelBundle<ValueOf<ModelDef.ChildList<M>>>>
export type ModelBundleDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.ChildDict<M>>]: ModelBundle<ModelDef.ChildDict<M>[K]>
}

export type ModelBundle<
    M extends ModelDef
> = {
    id: string;
    code: ModelDef.Code<M>,
    info: ModelDef.Info<M>,
    childList: ModelBundleList<M>,   
    childDict: ModelBundleDict<M>,
}

// 子节点
export type ModelList<M extends ModelDef> = Array<
    Model<ValueOf<ModelDef.ChildList<M>>>
>
export type ModelDict<M extends ModelDef> = {
    [K in KeyOf<ModelDef.ChildDict<M>>]: 
        Model<ModelDef.ChildDict<M>[K]>
}
