import type { App } from "../app";
import { 
    StatOf,
    InfoOf,
    ListOf,
    DictOf,
    RecvOf,
    BaseDef, 
    ParentOf
} from "./definition";
import { ComnSeq, DictSeq, ListSeq } from "./sequence";

export type ComnConf<M extends BaseDef> = ComnSeq<M> & {
    app   : App,
    parent: ParentOf<M>,
}

export type BaseConf<M extends BaseDef> = ComnConf<M> & {
    info : InfoOf<M>
    stat : StatOf<M>
    list : ListSeq<ListOf<M>>,
    dict : DictSeq<DictOf<M>>,
    event: RecvOf<M>,
}

