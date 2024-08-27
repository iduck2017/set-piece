/* eslint-disable max-len */
import type { Model } from "../models";
import { Updater } from "../utils/updater";
import type { RawModelConfig } from "./config";
import { ModelDef } from "./definition";
import { Event } from "./event";
import { ModelTmpl } from "./template";
import { Reflect } from ".";
import { CursorType } from "./cursor";

export namespace ModelType {
    /** 修饰器序列化参数 */
    export type UpdaterConfig<K> = CursorType.Config & {
        key: K
    }

    /** 模型修饰器序列化参数集合 */
    export type UpdaterConfigDict<
        M extends ModelTmpl = ModelTmpl
    > = {
        [K in keyof M[ModelDef.State]]: UpdaterConfig<K>
    }

    /** 模型基础触发器事件集合 */
    export type BaseEmitterEventDict<
        M extends ModelTmpl = ModelTmpl
    > = {
        stateUpdateDone: Event.StateUpdateDone<M>
        childUpdateDone: Event.ChildUpdateDone<M>
    } 
}


export namespace ModelReflect {
    // export type EmitterEventDict<M extends ModelTmpl> = M[ModelDef.EmitterEventDict] & RawModelEmitterEventDict<M> 
    export type UpdaterEventDict<M extends ModelTmpl> = { [K in keyof M[ModelDef.State]]: Event.StateUpdateBefore<M, K> }

    export type UpdaterDict<M extends ModelTmpl> = { [K in keyof M[ModelDef.State]]: Updater<M, K> }
    export type ChildChunkList<M extends ModelTmpl> = Array<Config<Reflect.Iterator<M[ModelDef.ChildList]>>>
    export type ChildChunkDict<M extends ModelTmpl> = { [K in keyof M[ModelDef.ChildDict]]: Config<M[ModelDef.ChildDict][K]> }
    
    export type Config<M extends Model | undefined> =  M extends Model<infer T> ? RawModelConfig<T> : undefined
}