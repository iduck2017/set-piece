import { Model, NodeModel } from "@/model/node";
import { Base } from "./base";
import { Def, NodeDef } from "./define";

export type Event<D extends Base.List> = (...args: D) => void; 
export type EventDict<D extends Base.Dict<Base.List>> = {
    [K in keyof D]: Event<Required<D>[K]>;
}

export class EventRes<
    E extends Base.List = Base.List
> {
    constructor(
        readonly target: NodeModel,
        readonly handler: Event<E>
    ) {}
}
export class EventReq<
    E extends Base.List = Base.List
> {
    constructor(
        readonly target: NodeModel,
        readonly key: string,
        readonly alias: Readonly<Base.List<EventReq<E>>> = []
    ) {}
}
export type EventReqDict<T extends Base.Dict> = {
    [K in keyof T]: EventReq<Required<T>[K]>;
}
export type EventReqList<T extends Base.Dict> = {
    [K in keyof T]: Base.List<EventReq<Required<T>[K]>>;
}


export type NodeEvent<
    M extends NodeModel,
    T extends Partial<NodeDef>
> = Def.Event<T> & {
    onAlter: NodeEvent.OnAlter<M>
    onCheck: NodeEvent.OnCheck<M>
    onSpawn: NodeEvent.OnSpawn<M>
}
export namespace NodeEvent {
    export type OnAlter<M extends NodeModel> = [M, Readonly<Model.State<M>>]
    export type OnSpawn<M extends NodeModel> = [M]
    export type OnCheck<M extends NodeModel> = [M, Model.State<M>]
}