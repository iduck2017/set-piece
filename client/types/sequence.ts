import { Model } from "../models/base";
import { ElemOf, Union } from "./base";
import { CalcIntf } from "./common";
import { 
    StatOf,
    ListOf,
    DictOf,
    RecvOf,
    CallOf,
    BaseDef, 
    IdOf,
    RuleOf
} from "./definition";
import { BaseModel, BaseList, BaseDict } from "./model";
import { KeyRef } from "./reference";

export type ListSeq<L extends BaseList> = Array<SeqOf<ElemOf<L>>>;
export type DictSeq<D extends BaseDict> = { [K in keyof D]: SeqOf<D[K]> };
export type ComnSeq<M extends BaseDef> = {
    id   : IdOf<M>;
    key? : string;
    rule : RuleOf<M>;
    stat?: Partial<StatOf<M>>;
    list?: ListSeq<ListOf<M>>;
    dict?: Partial<DictSeq<DictOf<M>>>;
    call?: KeyRef<Union<CalcIntf, CallOf<M>>>;
    recv?: KeyRef<RecvOf<M>>;
};

export type BaseSeq<M extends BaseDef> = {
    id  : IdOf<M>;
    rule: RuleOf<M>;
    key : string
    stat: Partial<StatOf<M>>
    list: ListSeq<ListOf<M>>
    dict: Partial<DictSeq<DictOf<M>>>
    call: KeyRef<Union<CalcIntf, CallOf<M>>>
    recv: KeyRef<RecvOf<M>>,
}

export type SeqOf<T extends BaseModel | undefined> = 
    T extends Model<infer M> ? ComnSeq<M> : undefined;