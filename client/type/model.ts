import { KeyOf, ValueOf } from ".";
import type { App } from "../app";
import { ModelRegistry } from "../services/factory";
import { IEffect } from "./effect";
import { ModelDef } from "./model-def";
import { ISignal } from "./signal";

// 模型层节点定义
export namespace IModel {
    // 反序列化参数
    export type RawConfig<
        M extends ModelDef
    > = Readonly<{
        code: ModelDef.Code<M>
        id?: string
        presetInfo?: Partial<ModelDef.StableInfo<M>>
        labileInfo?: Partial<ModelDef.LabileInfo<M>>
        signalDict?: ISignal.ConfigDict<M>,
        effectDict?: IEffect.ConfigDict<M>,
        childList?: IModel.ConfigList<M>,
        childDict?: Partial<IModel.ConfigDict<M>>,
        isInited?: boolean;
    }>

    // 自定义初始化参数
    export type Config<
        M extends ModelDef
    > = Readonly<{
        app: App,
        parent: ModelDef.Parent<M>
    }> & RawConfig<M>

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
        signalDict?: ISignal.ConfigDict<M>,
        effectDict?: IEffect.ConfigDict<M>,
        childList?: IModel.ConfigList<M>,
        childDict: IModel.ConfigDict<M>,
        isInited?: boolean;
    }

    // 序列化参数
    export type Bundle<
        M extends ModelDef
    > = {
        code: ModelDef.Code<M>,
        id: string;
        presetInfo?: Partial<ModelDef.StableInfo<M>>
        labileInfo: ModelDef.LabileInfo<M>,
        signalDict: ISignal.ConfigDict<M>,
        effectDict: IEffect.ConfigDict<M>,
        childList: IModel.BundleList<M>,   
        childDict: IModel.BundleDict<M>,
        isInited: true,
    }

    // 子节点字典/列表
    export type Dict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]: 
            IModel.Instance<ModelDef.ChildDict<M>[K]>
    }
    export type List<M extends ModelDef> = Array<
        IModel.Instance<ValueOf<ModelDef.ChildList<M>>>
    >


    // 子节点反序列化参数
    export type BundleDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]:
            IModel.Bundle<ModelDef.ChildDict<M>[K]>
    }
    export type BundleList<M extends ModelDef> = Array<
        IModel.Bundle<ValueOf<ModelDef.ChildList<M>>>
    >

    // 子节点序列化参数
    export type ConfigDict<M extends ModelDef> = {
        [K in KeyOf<ModelDef.ChildDict<M>>]: 
            IModel.RawConfig<ModelDef.ChildDict<M>[K]>
    }
    export type ConfigList<M extends ModelDef> = Array<
        IModel.RawConfig<ValueOf<ModelDef.ChildList<M>>>
    >

    export type Instance<M extends ModelDef> = InstanceType<ModelRegistry[ModelDef.Code<M>]>
    
}