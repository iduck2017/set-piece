/* eslint-disable max-len */
import type { Model } from "../models";
import type { IEvent } from "./event";
import { IBase, IReflect } from ".";
import type { ModelCode, ModelReg } from "./registry";
import { Emitter } from "../utils/emitter";
import type { Handler } from "../utils/handler";

export enum EmitterType {
    StateUpdateBefore,
    StateUpdateDone,
}

export namespace IModel {
    export type EmitterBundleDict<M extends IModel.Define> = {
        [K in IReflect.Key<EmitterDefDict<M>>]?: Array<{
            modelId: string;
            handlerKey: string;
        }>
    }
    export type HandlerBundleDict<M extends IModel.Define> = {
        [K in IReflect.Key<HandlerDefDict<M>>]?: Array<{
            modelId: string;
            emitterType?: EmitterType;
            emitterKey: string;
        }>
    }

    // 基础模型定义
    export type Define = {
        code: ModelCode
        rule: IBase.Data
        state: IBase.Data
        parent: Model;
        childDefList: Array<Define>
        childDefDict: Record<IBase.Key, Define>,
        emitterDefDict: IBase.Dict,
        handlerDefDict: IBase.Dict,
    }

    // 通用模型定义
    export type CommonDefine<
        M extends Partial<IModel.Define>
    > = M & Omit<{
        code: never,
        rule: {},
        state: {}
        parent: Model
        childDefList: []
        childDefDict: {}
        emitterDefDict: {},
        handlerDefDict: {},
    }, keyof M>
 
    // 模型定义反射
    export type Code<M extends Define> = M['code']
    export type Rule<M extends Define> = M['rule']
    export type State<M extends Define> = M['state']
    export type Parent<M extends Define> = M['parent']
    export type ChildDefList<M extends Define> = M['childDefList']
    export type ChildDefDict<M extends Define> = M['childDefDict']
    export type EmitterDefDict<M extends Define> = M['emitterDefDict']
    export type HandlerDefDict<M extends Define> = M['handlerDefDict']

    export type EmitterDict<E extends IBase.Dict> = {
        [K in IReflect.Key<E>]: Emitter<E[K]>
    }
    export type HandlerDict<H extends IBase.Dict> = {
        [K in IReflect.Key<H>]: Handler<H[K]>
    }
    export type StateUpdateBefore<M extends Define> = {
        [K in IReflect.Key<State<M>>]: IEvent.StateUpdateBefore<M, K>
    }
    export type StateUpdateDone<M extends Define> = {
        [K in IReflect.Key<State<M>>]: IEvent.StateUpdateDone<M, K>
    }
    export type HandlerCallerDict<M extends IBase.Dict> = {
        [K in IReflect.Key<M>]: (event: M[K]) => void
    }

  
    /** 从属模型集合/列表 */
    export type ChildDict<M extends Define> = {
        [K in keyof ChildDefDict<M>]: InstanceType<ModelReg[Code<ChildDefDict<M>[K]>]>
    }
    export type ChildList<M extends Define> =
        Array<InstanceType<ModelReg[Code<IReflect.Iterator<ChildDefList<M>>>]>>

    /** 从属模型序列化参数集合/列表 */
    export type ChildBundleDict<M extends Define> = {
        [K in keyof ChildDefDict<M>]: IModel.Bundle<ChildDefDict<M>[K]>
    }
    export type ChildBundleList<M extends Define> = 
        Array<IModel.Bundle<IReflect.Iterator<ChildDefList<M>>>>

    /** 从属模型初始化参数集合/列表 */
    export type ChildConfigDict<M extends Define> = {
        [K in keyof ChildDefDict<M>]: IModel.Config<ChildDefDict<M>[K]>
    }
    export type ChildConfigList<M extends Define> = 
        Array<IModel.Config<IReflect.Iterator<ChildDefList<M>>>>


          /** 模型序列化参数 */
    export type Bundle<
        M extends Define = Define
    > = {
        id: string
        inited: true
        code: Code<M>
        rule: Partial<Rule<M>>
        originState: State<M>
        childBundleList: ChildBundleList<M>,
        childBundleDict: ChildBundleDict<M>,
        eventEmitterBundleDict: EmitterBundleDict<EmitterDefDict<M>>,
        eventHandlerBundleDict: HandlerBundleDict<HandlerDefDict<M>>,
        stateUpdaterBundleDict: EmitterBundleDict<State<M>>,
        stateEmitterBundleDict: EmitterBundleDict<State<M>>,
    }

    /** 模型初始化参数 */
    export type BaseConfig<
        M extends Define = Define
    > = {
        id?: string
        inited?: boolean
        code: Code<M>
        rule?: Partial<Rule<M>>
        originState: State<M>
        childBundleList: ChildConfigList<M>,
        childBundleDict: ChildConfigDict<M>,
        eventEmitterBundleDict?: Partial<EmitterBundleDict<EmitterDefDict<M>>>,
        eventHandlerBundleDict?: Partial<HandlerBundleDict<HandlerDefDict<M>>>,
        stateUpdaterBundleDict?: Partial<EmitterBundleDict<State<M>>>,
        stateEmitterBundleDict?: Partial<EmitterBundleDict<State<M>>>,
    }
    export type Config<
        M extends Define = Define
    > = {
        id?: string
        inited?: boolean
        code: Code<M>
        rule?: Partial<Rule<M>>
        originState?: Partial<State<M>>
        childBundleList?: ChildConfigList<M>,
        childBundleDict?: Partial<ChildConfigDict<M>>,
        eventEmitterBundleDict?: Partial<EmitterBundleDict<EmitterDefDict<M>>>,
        eventHandlerBundleDict?: Partial<HandlerBundleDict<HandlerDefDict<M>>>,
        stateUpdaterBundleDict?: Partial<EmitterBundleDict<State<M>>>,
        stateEmitterBundleDict?: Partial<EmitterBundleDict<State<M>>>,
    }

}

