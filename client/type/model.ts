import { Model } from "@/model";
import { KeyOf, Strict, ValidOf, Value } from "./base";

export type ChunkOf<N extends Model> = N['chunk'] 
export type StateOf<N extends Model> = N['state'] 
export type ChildOf<N extends Model> = N['child'] 

export interface Chunk<
    T extends string = string,
    S extends Record<string, Value> = any,
    C extends Record<string, Model> | Model[] = any
> {
    code: T;
    uuid?: string;
    state?: Partial<S>;  
    child?: 
        C extends Array<any> ? ChunkOf<C[number]>[] : 
        C extends Record<string, Model>? Strict<{
            [K in KeyOf<ValidOf<C>>]?: ChunkOf<Required<C>[K]>;
        }> : never
}