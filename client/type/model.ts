/* eslint-disable max-len */
import type { Model } from "../models";
import type { EventType } from "./event";
import { IReflect } from ".";
import type { ModelKey, ModelReg } from "./registry";
import { BaseModelDef, CommonModelDef } from "./definition";

export namespace ModelType {
    export type UpdateBefore<K extends string> = `${K}UpdateBefore`
    export type UpdaterEventDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.State]> as UpdateBefore<K>]: EventType.StateUpdateBefore<M, K>
    }

    /** 唯一标识符索引 */
    export type EmitterChunkDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.EmitterEventDict]>]?: string[]
    }
    export type HandlerChunkDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.HandlerEventDict]>]?: string[]
    }
    export type UpdaterChunkDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<UpdaterEventDict<M>>]?: string[]
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
        updaterIdDict: UpdaterChunkDict<M>
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
        updaterChunkDict?: UpdaterChunkDict<M>
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
        updaterChunkDict?: UpdaterChunkDict<M>
    }

    /** 指针集合 */
    export type EmitterModelDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.EmitterEventDict]>]: Model<CommonModelDef<{
            handlerEventDict: Pick<M[ModelKey.EmitterEventDict], K>
        }>>[]
    }
    export type HandlerModelDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.HandlerEventDict]>]: Model<CommonModelDef<{
            emitterEventDict: Pick<M[ModelKey.HandlerEventDict], K> & BaseEmitterEventDict
        }>>[]
    }
    export type UpdaterModelDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<UpdaterEventDict<M>>]: Model<CommonModelDef<{
            handlerEventDict: Record<K, EventType.StateUpdateBefore<M, K>>
        }>>[]
    }


    /** 绑定解绑函数集合 */
    export type EmitterBinderDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.EmitterEventDict]>]: 
            (handler: IReflect.IteratorOf<EmitterModelDict<M>[K]>) => void
    }
    export type UpdaterBinderDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<UpdaterEventDict<M>>]: 
            (handler: IReflect.IteratorOf<UpdaterModelDict<M>[K]>) => void
    }

    /** 触发处理函数集合 */
    export type EmitterCallerDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.EmitterEventDict]>]: (event: M[ModelKey.EmitterEventDict][K]) => void
    }
    export type HandlerCallerDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<M[ModelKey.HandlerEventDict]>]: (event: M[ModelKey.HandlerEventDict][K]) => void
    }
    export type UpdaterCallerDict<M extends BaseModelDef> = {
        [K in IReflect.KeyOf<UpdaterEventDict<M>>]: (event: EventType.StateUpdateBefore<M, K>) => void
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

    /** 模型基础触发器事件集合 */
    export type BaseEmitterEventDict<
        M extends BaseModelDef = BaseModelDef
    > = {
        stateUpdateDone: EventType.StateUpdateDone<M>
        childUpdateDone: EventType.ChildUpdateDone<M>
    } 
}

