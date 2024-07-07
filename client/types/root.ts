import type { BunnyModel } from "../models/bunny";
import { ModelConf, PureTmpl } from "./model";
import { ModelId } from "./registry";

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

type RootTmpl = PureTmpl<{
    [0]: ModelId.ROOT,
    [1]: RootRule,
    [3]: RootStat,
    [6]: RootDict
}>

type RootConf = ModelConf<RootTmpl>

export {
    RootRule,
    RootStat,
    RootDict,

    RootTmpl,
    RootConf
};
