import type { BunnyModel } from "../models/bunny";
import { GenderType } from "./common";
import { ComnDef, PureDef } from "./definition";
import { ModelId } from "./registry";

export type BunnyDef = ComnDef<{
    id  : ModelId.BUNNY,
    stat: {
        weight: number,
        age   : number,
        gender: GenderType,
    },
    list: BunnyModel[],
}, PureDef>
