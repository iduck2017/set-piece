import { Model } from "@/model";

export enum ModelStatus {
    INIT = 0,
    BIND = 2,
    LOAD = 3,
}

export type ReferAddrs<
    R1 extends Record<string, Model>, 
    R2 extends Record<string, Model[]>,
> = 
    { [K in keyof R1]: string } & 
    { [K in keyof R2]: Readonly<string[]> } 

