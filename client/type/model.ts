/* eslint-disable max-len */
import type { Model } from "../models";
import { Updater } from "../utils/updater";
import { IEvent } from "./event";
import { IReflect } from ".";
import { IConnector } from "./connector";
import type { IModelDef, ModelKey } from "./definition";

export namespace IModel {
    /** 序列化参数 */
    export type Chunk<
        M extends IModelDef.Default
    > = {
        code: M[ModelKey.Code]
        id: string
        preset: Partial<M[ModelKey.Preset]>
        originState: M[ModelKey.State]
        childChunkList: IModel.ChildChunkList<M>,
        childChunkDict: IModel.ChildChunkDict<M>,
        emitterChunkDict: IConnector.ChunkDict<M[ModelKey.EmitterEventDict]>
        handlerChunkDict: IConnector.ChunkDict<M[ModelKey.HandlerEventDict]>
        updaterChunkDict: IConnector.ChunkDict<M[ModelKey.State]>
    }


    /** 初始化参数 */
    export type Config<
        M extends IModelDef.Default
    > = {
        id?: string
        code: M[ModelKey.Code]
        preset?: Partial<M[ModelKey.Preset]>
        originState: M[ModelKey.State]
        childChunkList: IModel.ChildConfigList<M>,
        childChunkDict: IModel.ChildConfigDict<M>,
        emitterChunkDict?: IConnector.ConfigDict<M[ModelKey.EmitterEventDict]>
        handlerChunkDict?: IConnector.ConfigDict<M[ModelKey.HandlerEventDict]>
        updaterChunkDict?: IConnector.ConfigDict<M[ModelKey.State]>
    }

    /** 原始初始化参数 */
    export type RawConfig<
        M extends IModelDef.Default
    > = {
        id?: string
        code: M[ModelKey.Code]
        preset?: Partial<M[ModelKey.Preset]>
        originState?: Partial<M[ModelKey.State]>
        childChunkList?: IModel.ChildConfigList<M>,
        childChunkDict?: Partial<IModel.ChildConfigDict<M>>,
        emitterChunkDict?: IConnector.ConfigDict<M[ModelKey.EmitterEventDict]>
        handlerChunkDict?: IConnector.ConfigDict<M[ModelKey.HandlerEventDict]>
        updaterChunkDict?: IConnector.ConfigDict<M[ModelKey.State]>
    }

    /** 状态修饰器集合 */
    export type UpdaterDict<
       M extends IModelDef.Default = IModelDef.Default
    > = {
        [K in keyof M[ModelKey.State]]: Updater<M, K>
    }

    /** 状态修饰器事件集合 */
    export type UpdaterEventDict<
        M extends IModelDef.Default
    > = { 
        [K in keyof M[ModelKey.State]]: IEvent.StateUpdateBefore<M, K> 
    }

    /** 状态修饰器序列化参数 */
    export type UpdaterConfig<K> = IConnector.Config & {
        key: K
    }

    /** 状态修饰器序列化参数集合 */
    export type UpdaterConfigDict<
        M extends IModelDef.Default = IModelDef.Default
    > = {
        [K in keyof M[ModelKey.State]]: UpdaterConfig<K>
    }

    /** 模型基础触发器事件集合 */
    export type DefaultEmitterEventDict<
        M extends IModelDef.Default = IModelDef.Default
    > = {
        stateUpdateDone: IEvent.StateUpdateDone<M>
        childUpdateDone: IEvent.ChildUpdateDone<M>
    } 


    /** 模型序列化参数反射 */
    export type ReflectChunk<
        M extends Model | undefined
    > = 
        M extends Model<infer T> ? Chunk<T> : undefined


    /** 模型初始化参数反射 */
    export type ReflectConfig<
        M extends Model | undefined
    > = 
        M extends Model<infer T> ? RawConfig<T> : undefined

    /** 模型子节点序列化参数集合 */
    export type ChildChunkList<
        M extends IModelDef.Default
    > = 
        Array<ReflectChunk<IReflect.Iterator<M[ModelKey.ChildList]>>>


    /** 模型子节点序列化参数集合 */
    export type ChildConfigList<
        M extends IModelDef.Default
    > = 
        Array<ReflectConfig<IReflect.Iterator<M[ModelKey.ChildList]>>>


    /** 模型子节点序列化参数集合 */
    export type ChildChunkDict<
        M extends IModelDef.Default    
    > = {
        [K in keyof M[ModelKey.ChildDict]]: ReflectChunk<M[ModelKey.ChildDict][K]>
    }

    
    /** 模型子节点初始化参数集合 */
    export type ChildConfigDict<
        M extends IModelDef.Default
    > = {
        [K in keyof M[ModelKey.ChildDict]]: ReflectConfig<M[ModelKey.ChildDict][K]>
    }

}
