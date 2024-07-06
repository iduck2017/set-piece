import type { BunnyModel } from "../models/bunny";
import { VoidData } from "./base";
import { GenderType } from "./enums";
import { ModelTemplate } from "./model";

type BunnyState = {
    age: number;
    weight: number;
    gender: GenderType;
}

type BunnyChildren = BunnyModel

type BunnyConfig = ModelTemplate<
    VoidData,
    VoidData,
    VoidData,
    BunnyState,
    BunnyChildren,
    VoidData
>

export {
    BunnyState,
    BunnyChildren,
    BunnyConfig
};
