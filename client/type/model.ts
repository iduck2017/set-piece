/* eslint-disable max-len */
import type { Model } from "../models";
import type { EventType } from "./event";
import { IReflect } from ".";
import type { ModelKey, ModelReg } from "./registry";
import { BaseModelDef, CommonModelDef } from "./definition";

/**
 * emitterEventDict: 事件触发器集合
 * handlerEventDict: 事件处理器集合
 * updaterStateDict: 状态修饰符集合
 * checkerStateDict: 状态检查器集合
 */
export namespace ModelType {
    // export type StateUpdateBefore<S extends string> = `${S}UpdateBefore`
    // export type StateUpdateDone<S extends string> = `${S}UpdateDone`

    /** 事件消费者参数 */
    // export type ConsumerEventDict<
    //     M extends BaseModelDef
    // > = M[ModelKey.EventDict] & { 
    //     [K in IReflect.KeyOf<M[ModelKey.State]> as StateUpdateBefore<K>]: 
    //         EventType.StateUpdateBefore<M, K>
    // } & {
    //     [K in IReflect.KeyOf<M[ModelKey.State]> as StateUpdateDone<K>]: 
    //         EventType.StateUpdateDone<M, K>
    // }

    /** 事件生产者参数 */
    // export type ProducerEventDict<M extends BaseModelDef> = {
    //     [K in IReflect.KeyOf<M[ModelKey.ProducerDefDict]>]: 
    //         Pick<M[ModelKey.ProducerDefDict][K][ModelKey.EventDict], K>
    // } & { 
    //     [K in IReflect.KeyOf<M[ModelKey.ComputerDefDict]> as StateUpdateBefore<K>]: 
    //         EventType.StateUpdateBefore<M[ModelKey.ComputerDefDict][K], K>
    // } & {
    //     [K in IReflect.KeyOf<M[ModelKey.ObserverDefDict]> as StateUpdateDone<K>]: 
    //         EventType.StateUpdateDone<M[ModelKey.ObserverDefDict][K], K>
    // }

    /** 事件消费者 */
    // export type ConsumerDict<M extends BaseModelDef> = {
    //     [K in IReflect.KeyOf<M[ModelKey.EventDict]>]: Model<CommonModelDef<{
    //         producerDefDict: Record<K, M>
    //     }>>
    // } & {
    //     [K in IReflect.KeyOf<M[ModelKey.State]> as StateUpdateBefore<K>]: Model<CommonModelDef<{
    //         computerDefDict: Record<K, M>
    //     }>>
    // } & {
    //     [K in IReflect.KeyOf<M[ModelKey.State]> as StateUpdateDone<K>]: Model<CommonModelDef<{
    //         observerDefDict: Record<K, M>
    //     }>>
    // }

    /** 事件生产者 */
    // export type ProducerDict<M extends BaseModelDef> = {
    //     [K in IReflect.KeyOf<M[ModelKey.ProducerDefDict]>]: 
    //         Model<M[ModelKey.ProducerDefDict][K]>
    //         // InstanceType<ModelReg[M[ModelKey.ProducerDefDict][K][ModelKey.Code]]>
    // } & {
    //     [K in IReflect.KeyOf<M[ModelKey.ComputerDefDict]> as StateUpdateBefore<K>]: 
    //         Model<M[ModelKey.ComputerDefDict][K]>
    //         // InstanceType<ModelReg[M[ModelKey.ComputerDefDict][K][ModelKey.Code]]>
    // } & {
    //     [K in IReflect.KeyOf<M[ModelKey.ObserverDefDict]> as StateUpdateDone<K>]: 
    //         Model<M[ModelKey.ObserverDefDict][K]>
    //         // InstanceType<ModelReg[M[ModelKey.ObserverDefDict][K][ModelKey.Code]]>
    // }


    export type ProducerListDict<M extends BaseModelDef> = {
        [K in Extract<IReflect.KeyOf<M[ModelKey.ProducerDefDict]>, 'stateUpdateBefore' | 'stateUpdateDone'>]: 
            Model<M[ModelKey.ProducerDefDict][K]>[]
    } & {
        stateUpdateBefore: {
            [K in IReflect.KeyOf<M[ModelKey.ComputerDefDict]>]: Model<M[ModelKey.ComputerDefDict][K]>[]
        },
        stateUpdateDone: {
            [K in IReflect.KeyOf<M[ModelKey.ObserverDefDict]>]: Model<M[ModelKey.ObserverDefDict][K]>[]
        }
    }

    export type ConsumerListDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.EventDict]>]: Model<CommonModelDef<{
            producerDefDict: Record<K, M>
        }>>[]
    } &  {
        stateUpdateBefore: {
            [K in IReflect.KeyOf<M[ModelKey.State]>]: Model<CommonModelDef<{
                computerDefDict: Record<K, M>
            }>>[]
        },
        stateUpdateDone: {
            [K in IReflect.KeyOf<M[ModelKey.State]>]: Model<CommonModelDef<{
                observerDefDict: Record<K, M>
            }>>[]
        }
    } 

    export type ConsumerChunkDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.EventDict]>]: string[]
    } & {
        stateUpdateBefore: {
            [K in IReflect.KeyOf<M[ModelKey.State]>]: string[]
        },
        stateUpdateDone: {
            [K in IReflect.KeyOf<M[ModelKey.State]>]: string[]
        }
    }

    export type ProducerChunkDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.ProducerDefDict]>]: string[]
    } & {
        stateUpdateBefore: {
            [K in IReflect.KeyOf<M[ModelKey.ComputerDefDict]>]: string[]
        },
        stateUpdateDone: {
            [K in IReflect.KeyOf<M[ModelKey.ObserverDefDict]>]: string[]
        }
    }


    /** 事件消费者队列 */
    // export type ConsumerListDict<M extends BaseModelDef> = {
    //     [K in IReflect.KeyOf<ConsumerDict<M>>]: ConsumerDict<M>[K][] 
    // }

    // /** 事件生产者队列 */
    // export type ProducerListDict<M extends BaseModelDef> = {
    //     [K in IReflect.KeyOf<ProducerDict<M>>]: ProducerDict<M>[K][] 
    // }

    // export type ConsumerChunkDict<M extends BaseModelDef> = {
    //     [K in IReflect.KeyOf<ConsumerDict<M>>]?: string[]
    // }

    // export type ProducerChunkDict<M extends BaseModelDef> = {
    //     [K in IReflect.KeyOf<ProducerDict<M>>]?: string[]
    // }

    /** 序列化参数 */
    export type Chunk<
        M extends BaseModelDef = BaseModelDef
    > = {
        id: string
        inited: true
        code: M[ModelKey.Code]
        preset: Partial<M[ModelKey.Preset]>
        originState: M[ModelKey.State]
        childChunkList: ChildChunkList<M>,
        childChunkDict: ChildChunkDict<M>,
        producerChunkDict: ProducerChunkDict<M>
        consumerChunkDict: ConsumerChunkDict<M>
    }

    /** 初始化参数 */
    export type Config<
        M extends BaseModelDef = BaseModelDef
    > = {
        id?: string
        inited?: boolean
        code: M[ModelKey.Code]
        preset?: Partial<M[ModelKey.Preset]>
        originState: M[ModelKey.State]
        childChunkList: ChildConfigList<M>,
        childChunkDict: ChildConfigDict<M>,
        producerChunkDict?: ProducerChunkDict<M>
        consumerChunkDict?: ConsumerChunkDict<M>
    }

    /** 原始初始化参数 */
    export type RawConfig<
        M extends BaseModelDef = BaseModelDef
    > = {
        id?: string
        inited?: boolean
        code: M[ModelKey.Code]
        preset?: Partial<M[ModelKey.Preset]>
        originState?: Partial<M[ModelKey.State]>
        childChunkList?: ChildConfigList<M>,
        childChunkDict?: Partial<ChildConfigDict<M>>,
        producerChunkDict?: ProducerChunkDict<M>
        consumerChunkDict?: ConsumerChunkDict<M>
    }


    /** 绑定解绑函数集合 */
    export type HandlerDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.ProducerDefDict]>]: (event: Pick<M[ModelKey.ProducerDefDict][K][ModelKey.EventDict], K>) => void
    } & {
        stateUpdateBefore: {
            [K in IReflect.KeyOf<M[ModelKey.ComputerDefDict]>]: (event: EventType.StateUpdateBefore<M[ModelKey.ComputerDefDict][K], K>) => void
        }
        stateUpdateDone: {
            [K in IReflect.KeyOf<M[ModelKey.ObserverDefDict]>]: (event: EventType.StateUpdateDone<M[ModelKey.ObserverDefDict][K], K>) => void
        }
    }

    export type EmitterDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.EventDict]>]: (event: M[ModelKey.EventDict][K]) => void
    } & {
        stateUpdateBefore: {
            [K in IReflect.KeyOf<M[ModelKey.State]>]: (event: EventType.StateUpdateBefore<M, K>) => void
        }
        stateUpdateDone: {
            [K in IReflect.KeyOf<M[ModelKey.State]>]: (event: EventType.StateUpdateDone<M, K>) => void
        }
    }

    export type BinderDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.EventDict]>]: {
            bind: (handler: Model<CommonModelDef<{
                producerDefDict: Record<K, M>
            }>>) => void
            unbind: (handler: Model<CommonModelDef<{
                producerDefDict: Record<K, M>
            }>>) => void
        }
    } & {
        stateUpdateBefore: {
            [K in IReflect.KeyOf<M[ModelKey.State]>]: {
                bind: (handler: Model<CommonModelDef<{
                    computerDefDict: Record<K, M>
                }>>) => void
                unbind: (handler: Model<CommonModelDef<{
                    computerDefDict: Record<K, M>
                }>>) => void
            }
        }
        stateUpdateDone: {
            [K in IReflect.KeyOf<M[ModelKey.State]>]: {
                bind: (handler: Model<CommonModelDef<{
                    observerDefDict: Record<K, M>
                }>>) => void
                unbind: (handler: Model<CommonModelDef<{
                    observerDefDict: Record<K, M>
                }>>) => void
            }
        }
    }

    // export type EmitterDict<M extends BaseModelDef> = {
    //     [K in IReflect.KeyOf<ConsumerEventDict<M>>]: (event: ConsumerEventDict<M>[K]) => void
    // }
    // export type BinderDict<M extends BaseModelDef> = {
    //     [K in IReflect.KeyOf<ConsumerEventDict<M>>]: {
    //         bind: (handler: ConsumerDict<M>[K]) => void
    //         unbind: (handler: ConsumerDict<M>[K]) => void
    //     }
    // }

    /** 子节点列表 */
    export type ChildList<M extends BaseModelDef> = Array<InstanceType<
        ModelReg[IReflect.IteratorOf<M[ModelKey.ChildDefList]>[ModelKey.Code]]
    >>
    
    export type ChildChunkList<M extends BaseModelDef> = Array<
        ModelType.Chunk<IReflect.IteratorOf<M[ModelKey.ChildDefList]>>
    >

    export type ChildConfigList<M extends BaseModelDef> = Array<
        ModelType.RawConfig<IReflect.IteratorOf<M[ModelKey.ChildDefList]>>
    >

    /** 子节点集合 */
    export type ChildDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.ChildDefDict]]: 
            InstanceType<ModelReg[M[ModelKey.ChildDefDict][K][ModelKey.Code]]>
    }

    export type ChildChunkDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.ChildDefDict]]: 
            ModelType.Chunk<M[ModelKey.ChildDefDict][K]>
    }

    export type ChildConfigDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.ChildDefDict]]: 
            ModelType.RawConfig<M[ModelKey.ChildDefDict][K]>
    }

}

