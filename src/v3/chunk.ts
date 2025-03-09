import { BaseModel, Model } from "./model";
import { BaseValue } from "./common";

export type Chunk<
    I extends string,
    S extends Record<string, BaseValue>,
    D extends Record<string, BaseValue>,
    C extends Record<string, BaseModel>,
    G extends Record<string, BaseModel[]>,
> = {
    uuid?: string;
    code: I;
    state?: Partial<S & D>;
    child?: Partial<ChildChunk<C>>;
    childGroup?: Partial<ChildGroupChunk<G>>;
}

export type BaseChunk<
    I extends string,
    S extends Record<string, BaseValue>,
    D extends Record<string, BaseValue>,
    C extends Record<string, BaseModel>,
    G extends Record<string, BaseModel[]>,
> = {
    uuid: string;
    code: I;
    state: S & D;
    child: ChildChunk<C>; 
    childGroup: ChildGroupChunk<G>;
}

export type ChildChunk<C extends Record<string, BaseModel>> = C extends C ? { [K in keyof C]?: Model.Chunk<Required<C>[K]> } : never;
export type ChildGroupChunk<G extends Record<string, BaseModel[]>> = { [K in keyof G]?: Array<Model.Chunk<Required<G>[K][number]>> }