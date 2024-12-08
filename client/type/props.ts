import { Model, NodeModel } from "@/model/node";
import { Base, Strict } from "./base";
import { NodeChunkDict, NodeChunk } from "./chunk";
import { Def, ListDef, NodeDef } from "./define";
import { EventReqList, NodeEvent } from "./event";

export type BaseNodeProps<T extends Partial<NodeDef>> = {
    uuid?: string;
    code: Def.Code<T>;
    state: Def.State<T>;
    event?: Partial<EventReqList<NodeEvent<NodeModel, T>>>
    parent: Def.Parent<T>;
}
export type BaseListProps<T extends Partial<ListDef>> = BaseNodeProps<T> & {
    child: Base.List<Model.Chunk<Def.Child<T>[number]>>
}

export type BaseDictProps<
    A extends Partial<NodeDef>,
    B extends NodeDef
> = {
    code: Def.Code<A>;
    state: Strict<Def.State<A> & Partial<Def.State<B>>>;
    child: 
        Strict<NodeChunkDict<Def.Child<A>> & 
        Partial<NodeChunkDict<Def.Child<B>>>>,
    event?: Partial<EventReqList<NodeEvent<NodeModel, A & B>>>
    parent: Def.Parent<A>;
}

export type NodeProps<T extends Partial<NodeDef>> = 
    NodeChunk<T> &
    { parent: Def.Parent<T> } &
    (Def.Child<T> extends Base.List<infer U extends NodeModel> ?
        { child?: Base.List<Model.Chunk<U>> } :
        { child?: Partial<NodeChunkDict<Def.Child<T>>> } )
