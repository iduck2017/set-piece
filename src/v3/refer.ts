import { RequiredKeys } from "utility-types"
import { BaseModel } from "./model"
    
export type ReferAddrs<
    R extends Record<string, BaseModel>
> = { [K in keyof R]?: string[] }

export type ReferGroupAddrs<
    R extends Record<string, BaseModel[]>
> = { [K in keyof R]?: string[][] }