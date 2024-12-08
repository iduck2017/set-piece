import { NodeModel } from "@/model/node";
import { Assign, Base } from "./base";

export type NodeDef = {
    code: string,
    state: Base.Dict<Base.Value>
    event: Base.Dict<Base.List> 
    child: Base.Dict<NodeModel>
    parent?: NodeModel
}
export type ListDef = NodeDef & {
    child: NodeModel[]
}

type PureDef = {
    code: never;
    state: Base.Dict<never>
    event: Base.Dict<never> 
    child: Base.Dict<never>
    parent: NodeModel
}

export namespace Def {
    export type Code<A extends Partial<NodeDef>> = Assign<A, PureDef>['code'];
    export type State<A extends Partial<NodeDef>> = Assign<A, PureDef>['state'];
    export type Event<A extends Partial<NodeDef>> = Assign<A, PureDef>['event'];
    export type Child<A extends Partial<NodeDef>> = Assign<A, PureDef>['child'];
    export type Parent<A extends Partial<NodeDef>> = Assign<A, PureDef>['parent'];
}
