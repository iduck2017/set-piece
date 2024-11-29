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
    state?: Partial<Strict<S>>;  
    child?: 
        C extends Array<any> ? ChunkOf<C[number]>[] : 
        C extends Record<string, Model>? Strict<{
            [K in KeyOf<ValidOf<C>>]?: ChunkOf<Required<C>[K]>;
        }> : never
}


export type OnModelAlter<M extends Model> = {
    target: M;
    prev: Readonly<StateOf<M>>;
    next: Readonly<StateOf<M>>;
}

export type OnModelSpawn<M extends Model> = {
    target: M;
    next: Readonly<ChildOf<M>>;
}

export type OnModelCheck<M extends Model> = {
    target: M;
    prev: Readonly<StateOf<M>>;
    next: StateOf<M>;
}

