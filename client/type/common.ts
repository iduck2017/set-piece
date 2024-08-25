import { BunnyModel } from "../models/bunny";
import { ModelCode } from "./code";
import { SpecificModelTmpl } from "./template";

export type BunnyModelTmpl = 
    SpecificModelTmpl<{
        code: ModelCode.Bunny,
        unstableState: {
            age: number,
            color: string,
            maxAgeOffset: number,
            weight: number
        },
        stableState: {
            maxAge: number,
            maxWeight: number,
        },
        childList: BunnyModel[],
    }>


export type RootModelTmpl = 
    SpecificModelTmpl<{
        code: ModelCode.Root,
        unstableState: {
            progress: number
        }
        childDict: {
            bunny?: BunnyModel
        }
    }>