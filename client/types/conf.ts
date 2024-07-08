import { ModelIntf, BaseRefer } from "./model";
import { BaseTmpl, TmplId } from "./tmpl";

type BaseConf<M extends BaseTmpl> = {
    referId?: string;
    modelId: M[TmplId.ID];
    rule: M[TmplId.RULE];
    info: M[TmplId.INFO],
    stat: M[TmplId.STAT];
    list: M[TmplId.LIST],
    dict: M[TmplId.DICT],
    intf: M[TmplId.RECVER],
    sender: BaseRefer<ModelIntf<M[TmplId.SENDER]>>
    recver: BaseRefer<M[TmplId.RECVER]>,
}

type ComnConf<M extends BaseTmpl> = {
    referId?: string;
    rule: M[TmplId.RULE];
    list?: M[TmplId.LIST];
    stat?: Partial<M[TmplId.STAT]>
    dict?: Partial<M[TmplId.DICT]>
    sender?: BaseRefer<ModelIntf<M[TmplId.SENDER]>>
    recver?: BaseRefer<M[TmplId.RECVER]>,
}

export {
    BaseConf,
    ComnConf
};