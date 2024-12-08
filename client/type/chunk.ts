import { OptionalKeys, RequiredKeys } from "utility-types";
import { DictDef, ListDef, Def, NodeDef } from "./define";
import { Model, NodeModel } from "@/model/node";
import { Base, Valid } from "./base";

export type NodeChunkDict<T extends Base.Dict<NodeModel>> = 
    { [K in RequiredKeys<Valid<T>>]: Model.Chunk<T[K]> } & 
    { [K in OptionalKeys<Valid<T>>]?: Model.Chunk<Required<T>[K]> }

export type NodeChunk<T extends Partial<NodeDef>> = {
    code: Def.Code<T>;
    uuid?: string;
    state?: Partial<Def.State<T>>;
}

export type DictChunk<T extends Partial<DictDef>> = NodeChunk<T> & {
    child?: Partial<NodeChunkDict<Def.Child<T>>>;
}
export type ListChunk<T extends Partial<ListDef>> = NodeChunk<T> & {
    child?: Base.List<Model.Chunk<Def.Child<T>[number]>>
}

