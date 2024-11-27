import { Model } from "@/model";
import { Base, KeyOf, Strict, ValidOf } from "./base";

export type ChunkOf<N extends Model> = N['chunk'] 
export type StateOf<N extends Model> = N['state'] 
export type ChildOf<N extends Model> = N['child'] 

export interface Chunk<
    T extends string = string,
    S extends Base.Data = any,
    C extends Model | Record<string, Model> = any
> {
    templ: T;
    refer?: string;
    state?: Partial<S>;  
    child?: 
        C extends Model ? ChunkOf<C>[] : 
        C extends Record<string, Model>? Strict<{
            [K in KeyOf<ValidOf<C>>]?: ChunkOf<Required<C>[K]>;
        }> : never
}