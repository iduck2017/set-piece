import { BunnyModel } from "../models/bunny";
import { GenderType } from "./common";
import { ComnDef, PureDef } from "./definition";
import { ModelId } from "./registry";

export type RootDef = ComnDef<{
    id  : ModelId.ROOT,
    stat: {
        progress: number,
    },
    rule: {
        name      : string;
        difficulty: number;
    }
    dict: {
        bunny: BunnyModel
    }
}, PureDef>