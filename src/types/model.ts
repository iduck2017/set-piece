import { Model } from "@/model";

export type Child<
    C1 extends Record<string, Model>,
    C2 extends Record<string, Model>
> = { [K in keyof C2]: Readonly<Required<C2>[K][]> } & C1

export type Refer<
    R1 extends Record<string, Model>, 
    R2 extends Record<string, Model>
> = 
    { [K in keyof R1]?: R1[K] } & 
    { [K in keyof R2]?: Readonly<Required<R2>[K][]> }

export type Addrs<
    R1 extends Record<string, Model>, 
    R2 extends Record<string, Model>,
> = 
    { [K in keyof R1]?: string } & 
    { [K in keyof R2]?: Readonly<string[]> } 


export type Route<P extends Model> = {
    parent?: P;
    path?: string;
}