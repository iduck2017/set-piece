/* eslint-disable max-len */
import type { Model } from "../models";
import type { Updater } from "../utils/updater";
import type { EventDecl } from "./event";
import { IReflect } from ".";
import { ConnectorDecl } from "./connector";
import type { IModelDef } from "./definition";
import { SafeEmitter } from "../utils/emitter";
import type { ModelKey, ModelReg } from "./registry";

export namespace ModelDecl {
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
        emitterChunkDict: ConnectorDecl.ChunkDict<M[ModelKey.EmitterEventDict]>
        handlerChunkDict: ConnectorDecl.ChunkDict<M[ModelKey.HandlerEventDict]>
        updaterChunkDict: ConnectorDecl.ChunkDict<M[ModelKey.State]>
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
        emitterChunkDict?: ConnectorDecl.ConfigDict<M[ModelKey.EmitterEventDict]>
        handlerChunkDict?: ConnectorDecl.ConfigDict<M[ModelKey.HandlerEventDict]>
        updaterChunkDict?: ConnectorDecl.ConfigDict<M[ModelKey.State]>
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
        emitterChunkDict?: ConnectorDecl.ConfigDict<M[ModelKey.EmitterEventDict]>
        handlerChunkDict?: ConnectorDecl.ConfigDict<M[ModelKey.HandlerEventDict]>
        updaterChunkDict?: ConnectorDecl.ConfigDict<M[ModelKey.State]>
    }

    /** 状态修饰器集合 */
    export type UpdaterDict<M extends IModelDef.Base> = {
        [K in keyof M[ModelKey.State]]: Updater<M, K>
    }
    export type UpdaterConfig<K> = ConnectorDecl.Config & { key: K }
    export type UpdaterConfigDict<M extends IModelDef.Base> = {
        [K in keyof M[ModelKey.State]]: UpdaterConfig<K>
    }
    export type UpdaterEventDict<M extends IModelDef.Base> = { 
        [K in keyof M[ModelKey.State]]: EventDecl.StateUpdateBefore<M, K> 
    }
    export type SafeUpdaterDict<M extends IModelDef.Base> = { 
        [K in keyof M[ModelKey.State]]: 
            SafeEmitter<EventDecl.StateUpdateBefore<M, K>, Model<M>> 
    }

    /** 模型基础触发器事件集合 */
    export type BaseEmitterEventDict<
        M extends IModelDef.Base = IModelDef.Base
    > = {
        stateUpdateDone: EventDecl.StateUpdateDone<M>
        childUpdateDone: EventDecl.ChildUpdateDone<M>
    } 

    export type ChildDict<M extends IModelDef.Base> = {
        [K in keyof M[ModelKey.ChildDefDict]]: InstanceType<ModelReg[M[ModelKey.ChildDefDict][K][ModelKey.Code]]>
    }
    export type ChildList<M extends IModelDef.Base> = 
        Array<InstanceType<ModelReg[IReflect.Iterator<M[ModelKey.ChildDefList]>[ModelKey.Code]]>>

    /** 模型子节点序列化参数集合 */
    export type ChildChunkList<M extends IModelDef.Base> = 
        Array<ModelDecl.Chunk<IReflect.Iterator<M[ModelKey.ChildDefList]>>>
    export type ChildConfigList<M extends IModelDef.Base> = 
        Array<ModelDecl.RawConfig<IReflect.Iterator<M[ModelKey.ChildDefList]>>>

    /** 模型子节点序列化参数集合 */
    export type ChildChunkDict<M extends IModelDef.Base> = {
        [K in keyof M[ModelKey.ChildDefDict]]: ModelDecl.Chunk<M[ModelKey.ChildDefDict][K]>
    }
    export type ChildConfigDict<M extends IModelDef.Base> = {
        [K in keyof M[ModelKey.ChildDefDict]]: ModelDecl.RawConfig<M[ModelKey.ChildDefDict][K]>
    }
}
