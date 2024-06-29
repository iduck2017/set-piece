import type { BunnyModel } from "../models/bunny";
import { VoidData } from "./base";
import { ModelRefer } from "./common";
import { GenderType } from "./enums";
import { IListConfig } from "./list";

type BunnyState = {
    age: number;
    weight: number;
    gender: GenderType;
}

type BunnyChildren = BunnyModel

type BunnyConfig = IListConfig<
    VoidData,
    VoidData,
    ModelRefer,
    ModelRefer,
    BunnyChildren
>

export {
    BunnyState,
    BunnyChildren,
    BunnyConfig
};
