import type { BunnyModel } from "../models/bunny";
import type { RootModel } from "../models/root";
import { ComnDef, PureDef } from "./definition";
import { ModelId } from "./registry";

export enum GenderType {
    MALE = 100000,
    FEMALE = 100001,
    NONE = 100002
}

export type BunnyDef = ComnDef<{
    id  : ModelId.BUNNY,
    stat: {
        weight: number,
        age   : number,
        gender: GenderType,
    },
    list: BunnyModel[],
}, PureDef>

export type RootDef = ComnDef<{
    id  : ModelId.ROOT,
    stat: {
        progress: number,
    },
    rule: {
        name : string;
        level: number;
    }
    dict: {
        bunny: BunnyModel
    },
    parent: RootModel
}, PureDef>

