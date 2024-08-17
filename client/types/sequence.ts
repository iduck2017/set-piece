import type { Model } from "../models/base";
import { 
    ElemOf, 
    Union 
} from "./base";
import { 
    StatOf,
    ListOf,
    DictOf,
    RecvOf,
    EmitOf,
    BaseDef, 
    IdOf,
    RuleOf,
    InfoOf,
    ParentOf
} from "./definition";
import type { 
    BaseModel, 
    BaseList, 
    BaseDict 
} from "./model";
import type { ConnSeqMap } from "./map";
import { App } from "../app";

export type ListSeq<L extends BaseList> = Array<SeqOf<ElemOf<L>>>;
export type DictSeq<D extends BaseDict> = { [K in keyof D]: SeqOf<D[K]> };
export type ComnSeq<M extends BaseDef> = {
    key?: string;
    id: IdOf<M>;
    rule: RuleOf<M>;
    stat?: Partial<StatOf<M>>;
    list?: ListSeq<ListOf<M>>;
    dict?: Partial<DictSeq<DictOf<M>>>;
    emit?: ConnSeqMap<EmitOf<M>>
    recv?: ConnSeqMap<RecvOf<M>>
    hook?: ConnSeqMap<Union<StatOf<M>, InfoOf<M>>>,
    pipe?: ConnSeqMap<Union<StatOf<M>, InfoOf<M>>>
};

export type SaveSeq<M extends BaseDef> = {
    key: string
    id: IdOf<M>;
    rule: RuleOf<M>;
    stat: Partial<StatOf<M>>
    list: ListSeq<ListOf<M>>
    dict: Partial<DictSeq<DictOf<M>>>
    emit: ConnSeqMap<EmitOf<M>>
    recv: ConnSeqMap<RecvOf<M>>
    hook: ConnSeqMap<Union<StatOf<M>, InfoOf<M>>>,
    pipe: ConnSeqMap<Union<StatOf<M>, InfoOf<M>>>
}

export type BaseSeq<M extends BaseDef> = {
    id: IdOf<M>;
    key?: string;
    rule: RuleOf<M>;
    emit?: ConnSeqMap<EmitOf<M>>;
    recv?: ConnSeqMap<RecvOf<M>>;
    hook?: ConnSeqMap<Union<StatOf<M>, InfoOf<M>>>,
    pipe?: ConnSeqMap<Union<StatOf<M>, InfoOf<M>>>
    info: InfoOf<M>
    stat: StatOf<M>
    list: ListSeq<ListOf<M>>,
    dict: DictSeq<DictOf<M>>,
}

export type SeqOf<T extends BaseModel | undefined> = 
    T extends Model<infer M> ? 
    ComnSeq<M> : 
    undefined;
