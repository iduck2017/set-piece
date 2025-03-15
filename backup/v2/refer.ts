import { RequiredKeys } from "utility-types"
import { Def } from "./define"
    
export type ReferAddrs<T extends Def> = 
    { [K in RequiredKeys<Def.Refer<T>>]: string[] } &
    { [K in keyof Def.Refer<T>]?: string[] }

export type ReferGroupAddrs<T extends Def> = 
    { [K in RequiredKeys<Def.ReferGroup<T>>]: string[][] } &
    { [K in keyof Def.ReferGroup<T>]?: string[][] }