import type { BunnyModel } from "../models/bunny";
import { VoidData } from "./base";
import { GenderType } from "./enums";
import { ModelConfig } from "./model";

type BunnyState = {
    age: number;
    weight: number;
    gender: GenderType;
}

type BunnyList = BunnyModel[]

type BunnyConfig = ModelConfig<
    VoidData,
    BunnyState,
    VoidData,
    VoidData,
    BunnyList,
    VoidData
>

export {
    BunnyState,
    BunnyList,
    BunnyConfig
};
