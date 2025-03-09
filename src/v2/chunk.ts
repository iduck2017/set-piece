import { RequiredKeys } from "utility-types";
import { Def } from "./define";
import { Model } from "./model";

export type Chunk<T extends Def> = {
    uuid?: string;
    code: Def.Code<T>;
    state?: Partial<Def.State<T> & Def.StateInner<T>>;
    child?: Partial<ChildChunk<T>>;
}

export type BaseChunk<T extends Def> = {
    uuid: string;
    code: Def.Code<T>;
    state: Def.State<T> & Def.StateInner<T>;
    child: ChildChunk<T>; 
}

export type ChildChunk<T extends Def> =
    T extends T ?
    { [K in RequiredKeys<Def.Child<T>>]: Model.Chunk<Required<Def.Child<T>>[K]> } & 
    { [K in keyof Def.Child<T>]?: Model.Chunk<Required<Def.Child<T>>[K]> }
    : never

export type ChildGroupChunk<T extends Def> =
    T extends T ?
    { [K in RequiredKeys<Def.ChildGroup<T>>]: Array<Model.Chunk<Required<Def.ChildGroup<T>>[K][number]>> } & 
    { [K in keyof Def.ChildGroup<T>]?: Array<Model.Chunk<Required<Def.ChildGroup<T>>[K][number]>> }
    : never