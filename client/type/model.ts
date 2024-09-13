/* eslint-disable max-len */
import type { Model } from "../models";
import type { EventType } from "./event";
import { IReflect } from ".";
import type { ModelReg } from "./registry";
import { BaseModelDef, CommonModelDef } from "./definition";

export namespace IModel {
    export type Code<M extends BaseModelDef> = M['code']
    export type State<M extends BaseModelDef> = M['state']
    export type Preset<M extends BaseModelDef> = M['preset']
    export type ChildDefList<M extends BaseModelDef> = M['childDefList']
    export type ChildDefDict<M extends BaseModelDef> = M['childDefDict']
    export type ReqDefDict<M extends BaseModelDef> = M['effectReqDefDict']
    export type EffectDict<M extends BaseModelDef> = M['effectDict']
    export type EffectReqDefDict<M extends BaseModelDef> = M['effectReqDefDict']['effect']
    export type ReduceReqDefDict<M extends BaseModelDef> = M['effectReqDefDict']['reduce']
    export type UpdateReqDefDict<M extends BaseModelDef> = M['effectReqDefDict']['update']

    export type EffectRes<R extends Record<string, BaseModelDef>> = Model<CommonModelDef<{
        reqDefDict: {
            effect: R,
            update: Record<string, BaseModelDef>,
            reduce: Record<string, BaseModelDef>,
        }
    }>>
    export type ReduceRes<R extends Record<string, BaseModelDef>> = Model<CommonModelDef<{
        reqDefDict: {
            effect: Record<string, BaseModelDef>,
            update: Record<string, BaseModelDef>,
            reduce: R,
        }
    }>>
    export type UpdateRes<R extends Record<string, BaseModelDef>> = Model<CommonModelDef<{
        reqDefDict: {
            effect: Record<string, BaseModelDef>,
            update: R,
            reduce: Record<string, BaseModelDef>,
        }
    }>>


    export type ReqChunkDict<M extends BaseModelDef> = {
        effect: { [K in IReflect.KeyOf<EffectReqDefDict<M>>]?: string[] },
        reduce: { [K in IReflect.KeyOf<ReduceReqDefDict<M>>]?: string[] },
        update: { [K in IReflect.KeyOf<UpdateReqDefDict<M>>]?: string[] },
    }

    export type ResChunkDict<M extends BaseModelDef> = {
        effect: { [K in IReflect.KeyOf<EffectDict<M>>]?: string[] },
        reduce: { [K in IReflect.KeyOf<State<M>>]?: string[] },
        update: { [K in IReflect.KeyOf<State<M>>]?: string[] },
    }

    export type ReqDict<M extends BaseModelDef> = {
        effect: { [K in IReflect.KeyOf<EffectReqDefDict<M>>]: Model<EffectReqDefDict<M>[K]>[] }
        reduce: { [K in IReflect.KeyOf<ReduceReqDefDict<M>>]: Model<ReduceReqDefDict<M>[K]>[] }
        update: { [K in IReflect.KeyOf<UpdateReqDefDict<M>>]: Model<UpdateReqDefDict<M>[K]>[] }
    }

    export type ResDict<M extends BaseModelDef> = {
        effect: { [K in IReflect.KeyOf<EffectDict<M>>]: EffectRes<Record<K, M>>[] }
        reduce: { [K in IReflect.KeyOf<State<M>>]: ReduceRes<Record<K, M>>[] }
        update: { [K in IReflect.KeyOf<State<M>>]: UpdateRes<Record<K, M>>[] }
    }

    export type HandleReqDict<M extends BaseModelDef> = {
        effect: { [K in IReflect.KeyOf<EffectReqDefDict<M>>]: (event: EffectDict<EffectReqDefDict<M>[K]>[K]) => void },
        reduce: { [K in IReflect.KeyOf<ReduceReqDefDict<M>>]: (event: EventType.StateUpdateDone<UpdateReqDefDict<M>[K], K>) => void }
        update: { [K in IReflect.KeyOf<UpdateReqDefDict<M>>]: (event: EventType.StateUpdateDone<UpdateReqDefDict<M>[K], K>) => void },
    }
    
    export type CallResDict<M extends BaseModelDef> = {
        effect: { [K in IReflect.KeyOf<EffectDict<M>>]: (event: EffectDict<M>[K]) => void },
        reduce: { [K in IReflect.KeyOf<State<M>>]: (event: EventType.StateUpdateBefore<M, K>) => void },
        update: { [K in IReflect.KeyOf<State<M>>]: (event: EventType.StateUpdateDone<M, K>) => void },
    }

    export type BindResDict<M extends BaseModelDef> = {
        effect: { [K in IReflect.KeyOf<EffectDict<M>>]: (model: EffectRes<Record<K, M>>) => void }
        reduce: { [K in IReflect.KeyOf<State<M>>]: (model: ReduceRes<Record<K, M>>) => void }
        update: { [K in IReflect.KeyOf<State<M>>]: (model: UpdateRes<Record<K, M>>) => void },
    }

    /** 序列化参数 */
    export type Chunk<
        M extends BaseModelDef = BaseModelDef
    > = {
        id: string
        inited: true
        code: Code<M>
        preset: Partial<Preset<M>>
        originState: State<M>
        childChunkList: ChildChunkList<M>,
        childChunkDict: ChildChunkDict<M>,
        reqChunkDict: ReqChunkDict<M>,
        resChunkDict: ResChunkDict<M>,
    }

    /** 初始化参数 */
    export type Config<
        M extends BaseModelDef = BaseModelDef
    > = {
        id?: string
        inited?: boolean
        code: Code<M>
        preset?: Partial<Preset<M>>
        originState: State<M>
        childChunkList: ChildConfigList<M>,
        childChunkDict: ChildConfigDict<M>,
        reqChunkDict?: Partial<ReqChunkDict<M>>,
        resChunkDict?: Partial<ResChunkDict<M>>,
    }

    /** 原始初始化参数 */
    export type RawConfig<
        M extends BaseModelDef = BaseModelDef
    > = {
        id?: string
        inited?: boolean
        code: Code<M>
        preset?: Partial<Preset<M>>
        originState?: Partial<State<M>>
        childChunkList?: ChildConfigList<M>,
        childChunkDict?: Partial<ChildConfigDict<M>>,
        reqChunkDict?: Partial<ReqChunkDict<M>>,
        resChunkDict?: Partial<ResChunkDict<M>>,
    }


    /** 子节点列表 */
    export type ChildList<M extends BaseModelDef> = Array<InstanceType<ModelReg[Code<IReflect.IteratorOf<ChildDefList<M>>>]>>
    export type ChildChunkList<M extends BaseModelDef> = Array<IModel.Chunk<IReflect.IteratorOf<ChildDefList<M>>>>
    export type ChildConfigList<M extends BaseModelDef> = Array<IModel.RawConfig<IReflect.IteratorOf<ChildDefList<M>>>>

    /** 子节点集合 */
    export type ChildDict<M extends BaseModelDef> = {
        [K in keyof ChildDefDict<M>]: InstanceType<ModelReg[Code<ChildDefDict<M>[K]>]>
    }
    export type ChildChunkDict<M extends BaseModelDef> = {
        [K in keyof ChildDefDict<M>]: IModel.Chunk<ChildDefDict<M>[K]>
    }
    export type ChildConfigDict<M extends BaseModelDef> = {
        [K in keyof ChildDefDict<M>]: IModel.RawConfig<ChildDefDict<M>[K]>
    }
}

