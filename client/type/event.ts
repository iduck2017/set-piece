import { Model, NodeModel } from "@/model/node";
import { Base } from "./base";
import { Def, NodeDef } from "./define";

export type Event<D extends Base.List> = (...args: D) => void; 
export type EventDict<D extends Base.Dict<Base.List>> = {
    [K in keyof D]: Event<Required<D>[K]>;
}

export class EventReq<
    E extends Base.List = Base.List
> {
    readonly alias: Base.List<EventReq<E>> = [ this ];
    readonly target: NodeModel; 
    readonly key: string;
    constructor(
        target: NodeModel,
        key: string
    ) {
        this.target = target;
        this.key = key;
    }
}
export type EventReqDict<T extends Base.Dict> = {
    [K in keyof T]: EventReq<Required<T>[K]>;
}

export class EventRes<
    E extends Base.List = Base.List
> {
    readonly target: NodeModel;
    readonly handler: Event<E>;
    constructor(
        target: NodeModel,
        handler: Event<E>
    ) {
        this.target = target;
        this.handler = handler;
    }
}

export type NodeEvent<
    M extends NodeModel,
    T extends Partial<NodeDef>
> = Def.Event<T> & {
    onModelAlter: NodeEvent.OnAlter<M>
    onModelCheck: NodeEvent.OnCheck<M>
    onModelSpawn: NodeEvent.OnSpawn<M>
}
export namespace NodeEvent {
    export type OnAlter<M extends NodeModel> = [M, Readonly<Model.State<M>>]
    export type OnSpawn<M extends NodeModel> = [M]
    export type OnCheck<M extends NodeModel> = [M]
}