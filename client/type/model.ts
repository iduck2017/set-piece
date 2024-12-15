import { NodeModel } from "@/model/node";
import { Def } from "./define";

export type Model<T extends Def = Def> = NodeModel<T>

export namespace Model {
    export type Code<M extends Model> = M['code']
    export type ChildList<M extends Model> = M['childList']
    export type ChildDict<M extends Model> = M['childDict']
    export type StateDict<M extends Model> = M['stateDict']
    export type ParamDict<M extends Model> = M['paramDict']
    export type Chunk<M extends Model> = M['chunk']
}