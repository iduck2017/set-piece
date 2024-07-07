import type { BunnyModel } from "../models/bunny";
import { GenderType } from "./enums";
import { ModelConf, PureTmpl } from "./model";
import { ModelId } from "./registry";

type BunnyStat = {
    age: number;
    weight: number;
    gender: GenderType;
}

type BunnyTmpl = PureTmpl<{
    [0]: ModelId.BUNNY,
    [3]: BunnyStat,
    [5]: BunnyModel[],
}>

type BunnyConf = ModelConf<BunnyTmpl>

export {
    BunnyStat,
    BunnyTmpl,
    BunnyConf
};
