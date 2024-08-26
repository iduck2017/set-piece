import { BunnyModel } from "../models/bunny";
import { ModelCode } from "./code";
import { SpecificModelTmpl } from "./template";

export type BunnyModelTmpl = 
    SpecificModelTmpl<{
        code: ModelCode.Bunny,
        state: {
            age: number,
            color: string,
            maxAgeOffset: number,
            weight: number,
            maxWeight: number,
        },
        childList: BunnyModel[],
    }>


export type RootModelTmpl = 
    SpecificModelTmpl<{
        code: ModelCode.Root,
        state: {
            progress: number,
        }
        childDict: {
            bunny?: BunnyModel
        }
    }>