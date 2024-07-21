import type { App } from "../app";
import { Union } from "./base";
import { CalcIntf } from "./common";
import { 
    StatOf,
    InfoOf,
    ListOf,
    DictOf,
    RecvOf,
    BaseDef, 
    ParentOf,
    IdOf,
    RuleOf,
    CallOf
} from "./definition";
import { KeyRef } from "./reference";
import type { DictSeq, ListSeq } from "./sequence";

export type ComnConf<M extends BaseDef> =  {
    id    : IdOf<M>;
    key?  : string;
    rule  : RuleOf<M>;
    stat? : Partial<StatOf<M>>;
    list? : ListSeq<ListOf<M>>;
    dict? : Partial<DictSeq<DictOf<M>>>;
    call? : KeyRef<Union<CalcIntf, CallOf<M>>>;
    recv? : KeyRef<RecvOf<M>>;
    app   : App,
    parent: ParentOf<M>,
}

export type BaseConf<M extends BaseDef> =  {
    id    : IdOf<M>;
    key?  : string;
    rule  : RuleOf<M>;
    call? : KeyRef<Union<CalcIntf, CallOf<M>>>;
    recv? : KeyRef<RecvOf<M>>;
    app   : App,
    parent: ParentOf<M>,
    info  : InfoOf<M>
    stat  : StatOf<M>
    list  : ListSeq<ListOf<M>>,
    dict  : DictSeq<DictOf<M>>,
    event : RecvOf<M>,
}

