import { ElemOf } from "./base";
import { BaseDict, BaseList, BaseModel, ModelIntf, BaseRefer } from "./model";
import type { BaseTmpl, TmplId } from "./tmpl";

type ChunkOf<T extends BaseModel | undefined> = 
    T extends BaseModel ? 
        ReturnType<T['serialize']> : 
        undefined;

type BaseChunk<M extends BaseTmpl> = {
    referId: string;
    modelId: M[TmplId.ID];

    rule: M[TmplId.RULE];
    stat: M[TmplId.STAT];
    list: ListChunk<M[TmplId.LIST]>;
    dict: DictChunk<M[TmplId.DICT]>;

    sender: BaseRefer<ModelIntf<M[TmplId.SENDER]>>;
    recver: BaseRefer<M[TmplId.RECVER]>;
};

type ListChunk<L extends BaseList> = Array<ChunkOf<ElemOf<L>>>;
type DictChunk<D extends BaseDict> = { [K in keyof D]: ChunkOf<D[K]> }


export {
    ChunkOf,

    BaseChunk,
    ListChunk,
    DictChunk
};
