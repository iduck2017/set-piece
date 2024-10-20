import { KeyOf } from "..";
import type { App } from "../../app";
import { ModelDef } from "./define";

// 模型初始化对象
export type ModelConfig<D extends ModelDef> = Readonly<{
    id?: string
    code: ModelDef.Code<D>
    state?: Partial<ModelDef.State<D>>
    childList?: ModelConfig.ChildList<D>,
    childDict?: Partial<ModelConfig.ChildDict<D>>,
}>

export namespace ModelConfig {
    export type ChildList<D extends ModelDef> = Array<
        ModelConfig<ModelDef.ChildList<D>[number]>
    >
    export type ChildDict<D extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<D>>]:
            ModelConfig<ModelDef.ChildDict<D>[K]>
    }
}

// 泛型模型初始化对象
export type TmplModelConfig<D extends ModelDef> =  
    ModelConfig<D> &
    Readonly<{
        app: App,
        parent: ModelDef.Parent<D>
    }>

// 基础模型初始化参数
export type BaseModelConfig<D extends ModelDef> = Readonly<{
    id?: string,
    app: App,
    code: ModelDef.Code<D>,
    state: ModelDef.State<D>,
    parent: ModelDef.Parent<D>,
    childList?: ModelConfig.ChildList<D>,
    childDict: ModelConfig.ChildDict<D>,
}>

