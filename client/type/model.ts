/* eslint-disable max-len */
import type { Model } from "../models";
import { Updater } from "../utils/updater";
import { IEvent } from "./event";
import { IReflect } from ".";
import { IConnector } from "./connector";
import type { IModelDef } from "./definition";
import { SafeEmitter } from "../utils/emitter";
import { ModelKey } from "./registry";

export namespace IModel {
    /** 序列化参数 */
    export type Chunk<
        M extends IModelDef.Base = IModelDef.Base
    > = {
        id: string
        inited: true
        code: M[ModelKey.Code]
        preset: Partial<M[ModelKey.Preset]>
        originState: M[ModelKey.State]
        childChunkList: ChildChunkList<M>,
        childChunkDict: ChildChunkDict<M>,
        emitterChunkDict: IConnector.ChunkDict<M[ModelKey.EmitterEventDict]>
        handlerChunkDict: IConnector.ChunkDict<M[ModelKey.HandlerEventDict]>
        updaterChunkDict: IConnector.ChunkDict<M[ModelKey.State]>
    }

    /** 初始化参数 */
    export type Config<
        M extends IModelDef.Base = IModelDef.Base
    > = {
        id?: string
        inited?: boolean
        code: M[ModelKey.Code]
        preset?: Partial<M[ModelKey.Preset]>
        originState: M[ModelKey.State]
        childChunkList: ChildConfigList<M>,
        childChunkDict: ChildConfigDict<M>,
        emitterChunkDict?: IConnector.ConfigDict<M[ModelKey.EmitterEventDict]>
        handlerChunkDict?: IConnector.ConfigDict<M[ModelKey.HandlerEventDict]>
        updaterChunkDict?: IConnector.ConfigDict<M[ModelKey.State]>
    }

    /** 原始初始化参数 */
    export type RawConfig<
        M extends IModelDef.Base = IModelDef.Base
    > = {
        id?: string
        inited?: boolean
        code: M[ModelKey.Code]
        preset?: Partial<M[ModelKey.Preset]>
        originState?: Partial<M[ModelKey.State]>
        childChunkList?: ChildConfigList<M>,
        childChunkDict?: Partial<ChildConfigDict<M>>,
        emitterChunkDict?: IConnector.ConfigDict<M[ModelKey.EmitterEventDict]>
        handlerChunkDict?: IConnector.ConfigDict<M[ModelKey.HandlerEventDict]>
        updaterChunkDict?: IConnector.ConfigDict<M[ModelKey.State]>
    }

    /** 状态修饰器集合 */
    export type UpdaterDict<M extends IModelDef.Base> = {
        [K in keyof M[ModelKey.State]]: Updater<M, K>
    }
    export type UpdaterConfig<K> = IConnector.Config & { key: K }
    export type UpdaterConfigDict<M extends IModelDef.Base> = {
        [K in keyof M[ModelKey.State]]: UpdaterConfig<K>
    }
    export type UpdaterEventDict<M extends IModelDef.Base> = { 
        [K in keyof M[ModelKey.State]]: IEvent.StateUpdateBefore<M, K> 
    }
    export type SafeUpdaterDict<M extends IModelDef.Base> = { 
        [K in keyof M[ModelKey.State]]: 
            SafeEmitter<IEvent.StateUpdateBefore<M, K>, Model<M>> 
    }

    /** 模型基础触发器事件集合 */
    export type BaseEmitterEventDict<
        M extends IModelDef.Base = IModelDef.Base
    > = {
        stateUpdateDone: IEvent.StateUpdateDone<M>
        childUpdateDone: IEvent.ChildUpdateDone<M>
    } 

    /** 模型参数反射 */
    export type ReflectChunk<M extends Model | undefined> = 
        M extends Model<infer T> ? Chunk<T> : undefined
    export type ReflectConfig<M extends Model | undefined> =
        M extends Model<infer T> ? RawConfig<T> : undefined
    export type ReflectParent<M extends Model | undefined> = 
        M extends Model<infer T> ? T[ModelKey.Parent] : undefined

    /** 模型子节点序列化参数集合 */
    export type ChildChunkList<M extends IModelDef.Base> = 
        Array<ReflectChunk<IReflect.Iterator<M[ModelKey.ChildList]>>>
    export type ChildConfigList<M extends IModelDef.Base> = 
        Array<ReflectConfig<IReflect.Iterator<M[ModelKey.ChildList]>>>

    /** 模型子节点序列化参数集合 */
    export type ChildChunkDict<M extends IModelDef.Base> = {
        [K in keyof M[ModelKey.ChildDict]]: ReflectChunk<M[ModelKey.ChildDict][K]>
    }
    export type ChildConfigDict<M extends IModelDef.Base> = {
        [K in keyof M[ModelKey.ChildDict]]: ReflectConfig<M[ModelKey.ChildDict][K]>
    }

}
