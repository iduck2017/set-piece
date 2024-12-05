import { Model } from "@/model";
import { HarshOf, ValidOf, Value, List, Dict } from "./base";
import { OptionalKeys, RequiredKeys } from "utility-types";

export type ChunkOf<N extends Model> = N['chunk'] 
export type StateOf<N extends Model> = N['state'] 
export type ChildOf<N extends Model> = N['child'] 
export type CodeOf<N extends Model> = N['code']

export type Chunk<
    T extends string = string,
    S extends Dict<Value> = Dict<Value>,
    C extends Dict<Model> | List<Model> = Dict<Model> | List<Model>
> = Readonly<{
    code: T;
    uuid?: string;
    state?: Partial<HarshOf<S>>;  
    child?: 
        C extends List ? ChunkOf<C[number]>[] : 
        C extends Dict ? HarshOf<{
            [K in RequiredKeys<ValidOf<C>>]?: ChunkOf<C[K]>;
        } & {
            [K in OptionalKeys<ValidOf<C>>]?: ChunkOf<Required<C>[K]>; 
        }> : never;
}>
