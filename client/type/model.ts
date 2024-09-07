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
    export type StateUpdateBefore<S extends string> = `${S}UpdateBefore`
    export type StateUpdateDone<S extends string> = `${S}UpdateDone`

    /** 事件参数 */
    export type EmitterEventDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.EmitterDefDict]>]: 
            {
                event: M[ModelKey.EmitterDefDict][K], 
                model: Model<CommonModelDef<{
                    emitterDefDict: Record<K, M>
                }>>
            }
    } & { 
        [K in IReflect.KeyOf<M[ModelKey.State]> as StateUpdateBefore<K>]: 
            {
                event: EventType.StateUpdateBefore<M, K>, 
                model: Model<CommonModelDef<{
                    updaterDefDict: Record<K, M>
                }>>
            }
    } & {
        [K in IReflect.KeyOf<M[ModelKey.State]> as StateUpdateDone<K>]: 
            {
                event: EventType.StateUpdateDone<M, K>, 
                model: Model<CommonModelDef<{
                    watcherDefDict: Record<K, M>
                }>>
            }
    }

    export type HandlerEventDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.EmitterDefDict]>]?: 
            [
                Pick<M[ModelKey.EmitterDefDict][K][ModelKey.EventDict], K>,
                InstanceType<ModelReg[M[ModelKey.EmitterDefDict][K][ModelKey.Code]]>
            ]
    } & { 
        [K in IReflect.KeyOf<M[ModelKey.UpdaterDefDict]> as StateUpdateBefore<K>]?: 
            [
                EventType.StateUpdateBefore<M[ModelKey.UpdaterDefDict][K], K>,
                InstanceType<ModelReg[M[ModelKey.UpdaterDefDict][K][ModelKey.Code]]>
            ]
    } & {
        [K in IReflect.KeyOf<M[ModelKey.WatcherDefDict]> as StateUpdateDone<K>]?: 
            [
                EventType.StateUpdateDone<M[ModelKey.WatcherDefDict][K], K>,
                InstanceType<ModelReg[M[ModelKey.WatcherDefDict][K][ModelKey.Code]]>
            ]
    }

    /** 模型参数 */
    // export type HandlerDict<M extends BaseModelDef> = {
    //     [K in IReflect.KeyOf<M[ModelKey.EventDict]>]: Model<CommonModelDef<{
    //         emitterDefDict: { [k in K]: M }  & Record<string, BaseModelDef>
    //     }>>
    // } & {
    //     [K in IReflect.KeyOf<M[ModelKey.State]> as StateUpdateBefore<K>]: Model<CommonModelDef<{
    //         updaterDefDict: { [k in K]: M }  & Record<string, BaseModelDef>
    //     }>>
    // } & {
    //     [K in IReflect.KeyOf<M[ModelKey.State]> as StateUpdateDone<K>]: Model<CommonModelDef<{
    //         watcherDefDict: Record<K, M>  & Record<string, BaseModelDef>
    //     }>>
    // }
    // export type EmitterDict<M extends BaseModelDef> = {
    //     [K in IReflect.KeyOf<M[ModelKey.EmitterDefDict]>]: 
    //         InstanceType<ModelReg[M[ModelKey.EmitterDefDict][K][ModelKey.Code]]>
    // } & {
    //     [K in IReflect.KeyOf<M[ModelKey.UpdaterDefDict]> as StateUpdateBefore<K>]: 
    //         InstanceType<ModelReg[M[ModelKey.UpdaterDefDict][K][ModelKey.Code]]>
    // } & {
    //     [K in IReflect.KeyOf<M[ModelKey.WatcherDefDict]> as StateUpdateDone<K>]: 
    //         InstanceType<ModelReg[M[ModelKey.WatcherDefDict][K][ModelKey.Code]]>
    // }

    /** 模型指针 */
    export type EmitterListDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<HandlerEventDict<M>>]: EmitterEventDict<M>[K]['model'][] 
    }
    export type HandlerListDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<EmitterEventDict<M>>]: HandlerDict<M>[K][] 
    }

    /** 唯一标识符索引 */
    export type EmitterChunkDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<EmitterEventDict<M>>]?: string[]
    }
    export type HandlerChunkDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<HandlerEventDict<M>>]?: string[]
    }

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
        emitterIdDict: EmitterChunkDict<M>
        handlerIdDict: HandlerChunkDict<M>
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
        emitterChunkDict?: EmitterChunkDict<M>
        handlerChunkDict?: HandlerChunkDict<M>
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
        emitterChunkDict?: EmitterChunkDict<M>
        handlerChunkDict?: HandlerChunkDict<M>
    }


    /** 绑定解绑函数集合 */
    export type EmitterBinderDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<HandlerDict<M>>]: (handler: HandlerDict<M>[K]) => void
    }
    export type EmitterCallerDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<EmitterEventDict<M>>]: (event: EmitterEventDict<M>[K]) => void
    }
    export type HandlerCallerDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<HandlerEventDict<M>>]: (event: HandlerEventDict<M>[K]) => void
    }

    /** 子节点列表 */
    export type ChildList<M extends BaseModelDef> = 
        Array<InstanceType<ModelReg[IReflect.IteratorOf<M[ModelKey.ChildDefList]>[ModelKey.Code]]>>
    export type ChildChunkList<M extends BaseModelDef> = 
        Array<ModelType.Chunk<IReflect.IteratorOf<M[ModelKey.ChildDefList]>>>
    export type ChildConfigList<M extends BaseModelDef> = 
        Array<ModelType.RawConfig<IReflect.IteratorOf<M[ModelKey.ChildDefList]>>>

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

