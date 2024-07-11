import { BaseData, BaseIntf, Union, VoidData, VoidList } from "./base";
import type { BaseDict, BaseList, BaseModel } from "./model";

export type BaseDef = {
    id    : number,
    rule  : BaseData,
    info  : BaseData,
    stat  : BaseData,
    list  : BaseList,
    dict  : BaseDict,
    recv  : BaseIntf,
    call  : BaseIntf,
    parent: BaseModel,
}

export type PureDef = {
    id    : never,
    rule  : VoidData,
    info  : VoidData,
    stat  : VoidData,
    list  : VoidList,
    dict  : VoidData,
    recv  : VoidData,
    call  : VoidData,
    parent: BaseModel,
}

export type ComnDef<T extends Partial<BaseDef>, M extends BaseDef> = Union<T, M>

export type IdOf<M extends BaseDef> = M['id'];
export type RuleOf<M extends BaseDef> = M['rule'];
export type InfoOf<M extends BaseDef> = M['info'];
export type StatOf<M extends BaseDef> = M['stat'];
export type ListOf<M extends BaseDef> = M['list'];
export type DictOf<M extends BaseDef> = M['dict'];
export type RecvOf<M extends BaseDef> = M['recv'];
export type CallOf<M extends BaseDef> = M['call'];
export type ParentOf<M extends BaseDef> = M['parent'];


