/* eslint-disable max-len */
import type { Model } from "../models";
import type { Updater } from "../utils/updater";
import type { EventType } from "./event";
import { IBase, IReflect } from ".";
import { ConnectorType } from "./connector";
import { SafeEmitter } from "../utils/emitter";
import type { ModelKey, ModelReg } from "./registry";
import { BaseModelDef, CommonModelDef } from "./definition";

export namespace ModelType {
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
        emitterChunkDict: ConnectorType.ChunkDictV2<M[ModelKey.EmitterEventDict]>
        handlerChunkDict: ConnectorType.ChunkDictV2<M[ModelKey.HandlerEventDict]>
        updaterChunkDict: UpdaterChunkDict<M>
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
        emitterChunkDict?: ConnectorType.ChunkDictV2<M[ModelKey.EmitterEventDict]>
        handlerChunkDict?: ConnectorType.ChunkDictV2<M[ModelKey.HandlerEventDict]>
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
        emitterChunkDict?: ConnectorType.ChunkDictV2<M[ModelKey.EmitterEventDict]>
        handlerChunkDict?: ConnectorType.ChunkDictV2<M[ModelKey.HandlerEventDict]>
        updaterChunkDict?: UpdaterChunkDict<M>
    }

    /** 状态修饰器集合 */
    export type UpdaterDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.State]]: Updater<M, K>
    }
    export type UpdaterConfig<K> = ConnectorType.Config & { key: K }
    export type UpdaterConfigDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.State]]: UpdaterConfig<K>
    }
    export type UpdaterEventDict<M extends BaseModelDef> = { 
        [K in keyof M[ModelKey.State]]: EventType.StateUpdateBefore<M, K> 
    }
    export type SafeUpdaterDict<M extends BaseModelDef> = { 
        [K in keyof M[ModelKey.State]]: 
            SafeEmitter<EventType.StateUpdateBefore<M, K>, Model<M>> 
    }

    /** 模型基础触发器事件集合 */
    export type BaseEmitterEventDict<
        M extends BaseModelDef = BaseModelDef
    > = {
        stateUpdateDone: EventType.StateUpdateDone<M>
        childUpdateDone: EventType.ChildUpdateDone<M>
    } 

    export type ChildDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.ChildDefDict]]: InstanceType<ModelReg[M[ModelKey.ChildDefDict][K][ModelKey.Code]]>
    }
    export type ChildList<M extends BaseModelDef> = 
        Array<InstanceType<ModelReg[IReflect.Iterator<M[ModelKey.ChildDefList]>[ModelKey.Code]]>>

    /** 模型子节点序列化参数集合 */
    export type ChildChunkList<M extends BaseModelDef> = 
        Array<ModelType.Chunk<IReflect.Iterator<M[ModelKey.ChildDefList]>>>
    export type ChildConfigList<M extends BaseModelDef> = 
        Array<ModelType.RawConfig<IReflect.Iterator<M[ModelKey.ChildDefList]>>>

    /** 模型子节点序列化参数集合 */
    export type ChildChunkDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.ChildDefDict]]: ModelType.Chunk<M[ModelKey.ChildDefDict][K]>
    }
    export type ChildConfigDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.ChildDefDict]]: ModelType.RawConfig<M[ModelKey.ChildDefDict][K]>
    }


    export type EmitterModelDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.EmitterEventDict]]?: Model<CommonModelDef<{
            handlerEventDict: Pick<M[ModelKey.EmitterEventDict], K>
        }>>[]
    }
    export type HandlerModelDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.HandlerEventDict]]?: Model<CommonModelDef<{
            emitterEventDict: Pick<M[ModelKey.HandlerEventDict], K> & BaseEmitterEventDict
        }>>[]
    }
    export type UpdaterModelDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.State] as StateUpdateBefore<K>]?: Model<CommonModelDef<{
            handlerEventDict: Record<StateUpdateBefore<K>, EventType.StateUpdateBefore<M, K>>
        }>>[]
    }

    export type EmitterBinderDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.EmitterEventDict]]: 
            (handler: Model<CommonModelDef<{
                handlerEventDict: Pick<M[ModelKey.EmitterEventDict], K>
            }>>) => void
    }
    export type CallerDict<E extends IBase.Dict> = {
        [K in keyof E]: (event: E[K]) => void   
    }

    export type StateUpdateBefore<S> = S extends string ? `${S}UpdateBefore` : S

    export type UpdaterCallerDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.State] as StateUpdateBefore<K>]: (value: M[ModelKey.State][K]) => void
    }
    export type UpdaterBinderDict<M extends BaseModelDef> = {
        [K in keyof M[ModelKey.State] as StateUpdateBefore<K>]: 
            (handler: Model<CommonModelDef<{
                handlerEventDict: Record<StateUpdateBefore<K>, EventType.StateUpdateBefore<M, K>>
            }>>) => void
    }

    export type UpdaterChunkDict<M extends BaseModelDef> = Record<StateUpdateBefore<keyof M[ModelKey.State]>, string[] | undefined>
}

