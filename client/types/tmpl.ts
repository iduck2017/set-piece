import { BaseData, VoidData, VoidList } from "./base";
import { BaseDict, BaseIntf, BaseList, BaseModel } from "./model";

enum TmplId {
    ID,
    RULE,
    INFO,
    STAT,
    LIST,
    DICT,
    PARENT,
    RECVER,
    SENDER,
}

type BaseTmpl = {
    [TmplId.ID]: number,
    [TmplId.RULE]: BaseData,
    [TmplId.INFO]: BaseData,
    [TmplId.STAT]: BaseData,
    [TmplId.LIST]: BaseList,
    [TmplId.DICT]: BaseDict,
    [TmplId.PARENT]: BaseModel,
    [TmplId.RECVER]: BaseIntf,
    [TmplId.SENDER]: BaseIntf,
}

type PureTmpl = {
    [TmplId.ID]: never,
    [TmplId.RULE]: VoidData,
    [TmplId.INFO]: VoidData,
    [TmplId.STAT]: VoidData,
    [TmplId.LIST]: VoidList,
    [TmplId.DICT]: VoidData,
    [TmplId.PARENT]: BaseModel,
    [TmplId.RECVER]: VoidData,
    [TmplId.SENDER]: VoidData,
}

export {
    TmplId,

    BaseTmpl,
    PureTmpl
};

