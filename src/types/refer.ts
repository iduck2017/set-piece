import { Model } from "@/model";

export type ReferAddrs<
    R1 extends Record<string, Model>, 
    R2 extends Record<string, Model>,
> = 
    { [K in keyof R1]?: string } & 
    { [K in keyof R2]?: Readonly<string[]> } 

export type Refer<
    R1 extends Record<string, Model>, 
    R2 extends Record<string, Model>
> = { [K in keyof R1]?: R1[K] } & 
    { [K in keyof R2]?: Readonly<R2[K][]> }
