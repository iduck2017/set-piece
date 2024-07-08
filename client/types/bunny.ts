import type { BunnyModel } from "../models/bunny";
import { UnionOf } from "./base";
import { ComnConf } from "./conf";
import { GenderType } from "./enums";
import { ModelId } from "./registry";
import { PureTmpl, TmplId } from "./tmpl";

type BunnyStat = {
    age: number;
    weight: number;
    gender: GenderType;
}

type BunnyTmpl = UnionOf<
    {
        [TmplId.ID]: ModelId.BUNNY,
        [TmplId.STAT]: BunnyStat,
        [TmplId.LIST]: BunnyModel[],
    },
    PureTmpl
>

type BunnyConf = ComnConf<BunnyTmpl>

export {
    BunnyStat,
    BunnyTmpl,
    BunnyConf
};
