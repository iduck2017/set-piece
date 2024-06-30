import type { BunnyModel } from "../models/bunny";
import { VoidData } from "./base";
import { GenderType } from "./enums";
import { IListConfig } from "./list";

type BunnyState = {
    age: number;
    weight: number;
    gender: GenderType;
}

type BunnyChildren = BunnyModel

type BunnyConfig = IListConfig<
    never,
    never,
    VoidData,
    VoidData,
    BunnyChildren
>

export {
    BunnyState,
    BunnyChildren,
    BunnyConfig
};
