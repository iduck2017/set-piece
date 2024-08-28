/* eslint-disable max-len */
import type { Model } from "../models";
import { Updater } from "../utils/updater";
import type { RawModelConfig } from "./config";
import { ModelDef } from "./definition";
import { EventType } from "./event";
import { ModelTmpl } from "./template";
import { Reflect } from ".";
import { LinkerType } from "./linker";
import { ModelChunk } from "./chunk";

export namespace ModelType {
    /** 状态修饰器集合 */
    export type UpdaterDict<
        M extends ModelTmpl = ModelTmpl
    > = {
        [K in keyof M[ModelDef.State]]: Updater<M, K>
    }

    /** 状态修饰器事件集合 */
    export type UpdaterEventDict<
        M extends ModelTmpl
    > = { 
        [K in keyof M[ModelDef.State]]: EventType.StateUpdateBefore<M, K> 
    }

    /** 状态修饰器序列化参数 */
    export type UpdaterConfig<K> = LinkerType.Config & {
        key: K
    }

    /** 状态修饰器序列化参数集合 */
    export type UpdaterConfigDict<
        M extends ModelTmpl = ModelTmpl
    > = {
        [K in keyof M[ModelDef.State]]: UpdaterConfig<K>
    }

    /** 模型基础触发器事件集合 */
    export type BaseEmitterEventDict<
        M extends ModelTmpl = ModelTmpl
    > = {
        stateUpdateDone: EventType.StateUpdateDone<M>
        childUpdateDone: EventType.ChildUpdateDone<M>
    } 


    /** 模型序列化参数反射 */
    export type ReflectChunk<
        M extends Model | undefined
    > = 
        M extends Model<infer T> ? ModelChunk<T> : undefined


    /** 模型初始化参数反射 */
    export type ReflectConfig<
        M extends Model | undefined
    > = 
        M extends Model<infer T> ? RawModelConfig<T> : undefined

    /** 模型子节点序列化参数集合 */
    export type ChildChunkList<
        M extends ModelTmpl = ModelTmpl
    > = 
        Array<ReflectChunk<Reflect.Iterator<M[ModelDef.ChildList]>>>


    /** 模型子节点序列化参数集合 */
    export type ChildConfigList<
        M extends ModelTmpl = ModelTmpl
    > = 
        Array<ReflectConfig<Reflect.Iterator<M[ModelDef.ChildList]>>>


    /** 模型子节点序列化参数集合 */
    export type ChildChunkDict<
        M extends ModelTmpl = ModelTmpl
    > = {
        [K in keyof M[ModelDef.ChildDict]]: ReflectChunk<M[ModelDef.ChildDict][K]>
    }

    
    /** 模型子节点初始化参数集合 */
    export type ChildConfigDict<
        M extends ModelTmpl = ModelTmpl
    > = {
        [K in keyof M[ModelDef.ChildDict]]: ReflectConfig<M[ModelDef.ChildDict][K]>
    }
}
