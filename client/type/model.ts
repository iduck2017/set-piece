/* eslint-disable max-len */
import type { Model } from "../models";
import type { IEvent } from "./event";
import { IBase, IReflect } from ".";
import type { ModelCode, ModelReg } from "./registry";
import type { App } from "../app";

/** 模型 */
export namespace IModel {
    /** 基础模型定义 */
    export type Define = {
        /** 数据结构定义 */
        code: ModelCode
        rule: IBase.Data
        state: IBase.Data
        /** 从属关系定义 */
        parent: Model | App;
        childDefList: Array<Define>
        childDefDict: Record<IBase.Key, Define>,
        /** 依赖关系定义 */
        eventDict: IBase.Dict,
        listenedDefDict: Record<IBase.Key, Define>,
        modifiedDefDict: Record<IBase.Key, Define>,
        observedDefDict: Record<IBase.Key, Define>,
    }

    export type PureDefine = {
        /** 数据结构定义 */
        code: never,
        rule: {},
        state: {}
        /** 从属关系定义 */
        parent: Model | App
        childDefList: []
        childDefDict: {}
        /** 依赖关系定义 */
        eventDict: {}
        listenedDefDict: {}
        modifiedDefDict: {}
        observedDefDict: {} 
    }

    /** 通用模型定义 */
    export type CommonDefine<
        M extends Partial<Define>,
        D = PureDefine
    > = M & Omit<D, keyof M>

    /** 
     * 基础模型定义字段反射
     * 数据结构定义
     */
    export type Code<M extends Define> = M['code']
    export type Rule<M extends Define> = M['rule']
    export type State<M extends Define> = M['state']

    /** 从属关系定义 */
    export type Parent<M extends Define> = M['parent']
    export type ChildDefList<M extends Define> = M['childDefList']
    export type ChildDefDict<M extends Define> = M['childDefDict']

    /** 依赖关系定义 */
    export type EventDict<M extends Define> = M['eventDict']
    export type ListenedDefDict<M extends Define> = M['listenedDefDict']
    export type ModifiedDefDict<M extends Define> = M['modifiedDefDict']
    export type ObservedDefDict<M extends Define> = M['observedDefDict']

    /**
     * 特殊模型
     * 事件监听器
    */
    export type Listener<
        R extends Record<IBase.Key, Define>
    > = Model<
        CommonDefine<{
            listenedDefDict: R
        }, Define>
    >

    /** 状态修饰器 */
    export type Modifier<
        R extends Record<IBase.Key, Define>
    > = Model<
        CommonDefine<{
            modifiedDefDict: R
        }, Define>
    >
    
    /** 状态观察器 */
    export type Observer<
        R extends Record<IBase.Key, Define>
    > = Model<
        CommonDefine<{
            observedDefDict: R
        }, Define>
    >

    /** 依赖标识符集合 */
    export type ListenerIdDict<M extends Define> = {
        [K in IReflect.Key<EventDict<M>>]?: string[]
    }
    export type ModifierIdDict<M extends Define> = {
        [K in IReflect.Key<State<M>>]?: string[]
    }
    export type ObserverIdDict<M extends Define> = {
        [K in IReflect.Key<State<M>>]?: string[]
    }
    export type ListenedIdDict<M extends Define> = {
        [K in IReflect.Key<ListenedDefDict<M>>]?: string[]
    }
    export type ModifiedIdDict<M extends Define> = {
        [K in IReflect.Key<ModifiedDefDict<M>>]?: string[]
    }
    export type ObservedIdDict<M extends Define> = {
        [K in IReflect.Key<ObservedDefDict<M>>]?: string[]
    }

    /** 依赖集合 */
    export type ListenerDict<M extends Define> = {
        [K in IReflect.Key<EventDict<M>>]: Listener<Record<K, M>>[]
    }
    export type ModifierDict<M extends Define> = {
        [K in IReflect.Key<State<M>>]: Modifier<Record<K, M>>[]
    }
    export type ObserverDict<M extends Define> = {
        [K in IReflect.Key<State<M>>]: Observer<Record<K, M>>[]
    }
    export type ListenedDict<M extends Define> = {
        [K in IReflect.Key<ListenedDefDict<M>>]: Model<ListenedDefDict<M>[K]>[]
    }
    export type ModifiedDict<M extends Define> = {
        [K in IReflect.Key<ModifiedDefDict<M>>]: Model<ModifiedDefDict<M>[K]>[]
    }
    export type ObservedDict<M extends Define> = {
        [K in IReflect.Key<ObservedDefDict<M>>]: Model<ObservedDefDict<M>[K]>[]
    }

    /** 事件触发器集合 */
    export type EventEmitterDict<M extends Define> = {
        listened: {
            [K in IReflect.Key<EventDict<M>>]: (event: EventDict<M>[K]) => void
        },
        modified: {
            [K in IReflect.Key<State<M>>]: (event: IEvent.StateUpdateBefore<M, K>) => void
        },
        observed: {
            [K in IReflect.Key<State<M>>]: (event: IEvent.StateUpdateDone<M, K>) => void
        }
    }
    /** 事件处理器集合 */
    export type EventHandlerDict<M extends Define> = {
        listener: {
            [K in IReflect.Key<ListenedDefDict<M>>]: (
                event: EventDict<ListenedDefDict<M>[K]>[K]
            ) => void
        },
        modifier: {
            [K in IReflect.Key<ModifiedDefDict<M>>]: (
                event: IEvent.StateUpdateBefore<ModifiedDefDict<M>[K], K>
            ) => void
        },
        observer: {
            [K in IReflect.Key<ObservedDefDict<M>>]: (
                event: IEvent.StateUpdateDone<ModifiedDefDict<M>[K], K>
            ) => void
        }
    }

    /** 事件绑定器集合 */
    export type EventChannelDict<M extends Define> = {
        listened: {
            [K in IReflect.Key<EventDict<M>>]: {
                bind: (model: Listener<Record<K, M>>) => void,
                unbind: (model: Listener<Record<K, M>>) => void,
            }
        },
        modified: {
            [K in IReflect.Key<State<M>>]: {
                bind: (model: Modifier<Record<K, M>>) => void,
                unbind: (model: Modifier<Record<K, M>>) => void,
            }
        },
        observed: {
            [K in IReflect.Key<State<M>>]: {
                bind: (model: Observer<Record<K, M>>) => void,
                unbind: (model: Observer<Record<K, M>>) => void,
            }
        }
    }

    /** 序列化参数 */
    export type Bundle<
        M extends Define = Define
    > = {
        id: string
        activated: true
        code: Code<M>
        rule: Partial<Rule<M>>
        originState: State<M>
        childBundleList: ChildBundleList<M>,
        childBundleDict: ChildBundleDict<M>,
        listenedIdDict: ListenedIdDict<M>,
        listenerIdDict: ListenerIdDict<M>,
        modifiedIdDict: ModifiedIdDict<M>,
        modifierIdDict: ModifierIdDict<M>,
        observedIdDict: ObservedIdDict<M>,
        observerIdDict: ObserverIdDict<M>,
    }

    /** 初始化参数 */
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
        listenedIdDict?: ListenedIdDict<M>,
        listenerIdDict?: ListenerIdDict<M>,
        modifiedIdDict?: ModifiedIdDict<M>,
        modifierIdDict?: ModifierIdDict<M>,
        observedIdDict?: ObservedIdDict<M>,
        observerIdDict?: ObserverIdDict<M>,
    }

    /** 原始初始化参数 */
    export type Config<
        M extends Define = Define
    > = {
        id?: string
        activated?: boolean
        code: Code<M>
        rule?: Partial<Rule<M>>
        originState?: Partial<State<M>>
        childBundleList?: ChildConfigList<M>,
        childBundleDict?: Partial<ChildConfigDict<M>>,
        listenedIdDict?: ListenedIdDict<M>,
        listenerIdDict?: ListenerIdDict<M>,
        modifiedIdDict?: ModifiedIdDict<M>,
        modifierIdDict?: ModifierIdDict<M>,
        observedIdDict?: ObservedIdDict<M>,
        observerIdDict?: ObserverIdDict<M>,
    }

    /** 从属模型列表 */
    export type ChildList<M extends Define> =
        Array<InstanceType<ModelReg[Code<IReflect.Iterator<ChildDefList<M>>>]>>
    export type ChildBundleList<M extends Define> = 
        Array<IModel.Bundle<IReflect.Iterator<ChildDefList<M>>>>
    export type ChildConfigList<M extends Define> = 
        Array<IModel.Config<IReflect.Iterator<ChildDefList<M>>>>

    /** 从属模型集合 */
    export type ChildDict<M extends Define> = {
        [K in keyof ChildDefDict<M>]: InstanceType<ModelReg[Code<ChildDefDict<M>[K]>]>
    }
    export type ChildBundleDict<M extends Define> = {
        [K in keyof ChildDefDict<M>]: IModel.Bundle<ChildDefDict<M>[K]>
    }
    export type ChildConfigDict<M extends Define> = {
        [K in keyof ChildDefDict<M>]: IModel.Config<ChildDefDict<M>[K]>
    }
}

