import { BunnyModel } from "../models/bunny";
import type { RootModel } from "../models/root";
import { Union } from "./base";
import {  PureDef } from "./definition";
import { ModelId } from "./registry";

export type RootDef = Union<{
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