import type { App } from "../app";
import { Union } from "./base";
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
import { ModelIntf } from "./interface";
import { KeyRef } from "./reference";
import type { ComnSeq, DictSeq, ListSeq } from "./sequence";

export type ComnConf<M extends BaseDef> = ComnSeq<M> & {
    app   : App,
    parent: ParentOf<M>,
}

export type BaseConf<M extends BaseDef> = {
    id    : IdOf<M>;
    key?  : string;
    rule  : RuleOf<M>;
    call? : KeyRef<Union<ModelIntf, CallOf<M>>>;
    recv? : KeyRef<RecvOf<M>>;
    app   : App,
    parent: ParentOf<M>,
    info  : InfoOf<M>
    stat  : StatOf<M>
    list  : ListSeq<ListOf<M>>,
    dict  : DictSeq<DictOf<M>>,
    event : RecvOf<M>,
}

