import type { BunnyModel } from "../models/bunny";
import { VoidData } from "./base";
import { GenderType } from "./enums";
import { ModelTemplate } from "./model";

type BunnyState = {
    age: number;
    weight: number;
    gender: GenderType;
}

type BunnyList = BunnyModel[]

type BunnyConfig = ModelTemplate<
    VoidData,
    VoidData,
    VoidData,
    BunnyState,
    BunnyList,
    VoidData
>

export {
    BunnyState,
    BunnyList,
    BunnyConfig
};
