import type { BunnyModel } from "../models/bunny";
import { UnionOf } from "./base";
import { ComnConf } from "./conf";
import { ModelId } from "./registry";
import { PureTmpl, TmplId } from "./tmpl";

type RootRule = {
    name: string;
    difficulty: number;
};
type RootStat = {
    progress: number
}

type RootDict = {
    bunny: BunnyModel
}

type RootTmpl = UnionOf<
    {
        [TmplId.ID]: ModelId.ROOT,
        [TmplId.RULE]: RootRule,
        [TmplId.STAT]: RootStat,
        [TmplId.DICT]: RootDict
    },
    PureTmpl
>

type RootConf = ComnConf<RootTmpl>

export {
    RootRule,
    RootStat,
    RootDict,

    RootTmpl,
    RootConf
};
