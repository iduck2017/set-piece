import { OptionalKeys, RequiredKeys } from "utility-types";
import { Dict, HarshOf, KeyOf, ValidOf, Value } from "./type/base";

type NodeDef = {
    code: string,
    state: Dict<Value>
    event: Dict<any> 
    child: Dict<NodeModel>
    parent?: NodeModel
}

type PureDef = {
    code: never;
    state: Dict<never>
    event: Dict<never>
    child: Dict<never>
    parent: NodeModel
}

type Override<
    A extends Dict, 
    B extends Dict
> = A & Omit<B, KeyOf<A>>

namespace NodeDef {
    export type Code<T extends Partial<NodeDef>> = Override<T, PureDef>['code']
    export type State<T extends Partial<NodeDef>> = Override<T, PureDef>['state']
    export type Event<T extends Partial<NodeDef>> = Override<T, PureDef>['event']
    export type Child<T extends Partial<NodeDef>> = Override<T, PureDef>['child']
    export type Parent<T extends Partial<NodeDef>> = Override<T, PureDef>['parent']
}

export type ChildNodeChunk<T extends Partial<NodeDef>> = 
    HarshOf<{
        [K in RequiredKeys<ValidOf<NodeDef.Child<T>>>]: 
            NodeModel.Chunk<NodeDef.Child<T>[K]>
    } & {
        [K in OptionalKeys<ValidOf<NodeDef.Child<T>>>]?: 
            NodeModel.Chunk<Required<NodeDef.Child<T>>[K]>; 
    }> 

type BaseNodeChunk<T extends Partial<NodeDef>> = {
    code: NodeDef.Code<T>;
    state: NodeDef.State<T>;
    child: ChildNodeChunk<T>
}

type NodeChunk<T extends Partial<NodeDef>> = {
    code: NodeDef.Code<T>;
    state?: Partial<NodeDef.State<T>>;
    child?: Partial<ChildNodeChunk<T>>
}

namespace NodeModel {
    export type Chunk<M extends NodeModel> = M['chunk']
}

class NodeModel<T extends Partial<NodeDef> = NodeDef> {
    code!: NodeDef.Code<T>;
    uuid!: string;
    parent!: NodeDef.Parent<T>;

    _state!: NodeDef.State<T>;
    state!: Readonly<NodeDef.State<T>>;
    
    _child!: ChildNodeChunk<T>;
    child!: Readonly<HarshOf<NodeDef.Child<T>>>;

    chunk!: NodeChunk<T>;

    constructor(
        chunk: BaseNodeChunk<T>,
        parent: NodeDef.Parent<T>
    ) {

    }
}

type FeatDef = { code: 'feat' }
class FeatModel extends NodeModel<FeatDef> {
    constructor(
        chunk: NodeChunk<FeatDef>,
        parent: NodeDef.Parent<FeatDef>
    ) {
        super({
            ...chunk,
            child: {},
            state: {}
        }, parent);
    }
}

type AnimalDef = {
    code: string,
    state: {
        isAlive: boolean
    },
    child: {
        feat: FeatModel
    }
}
type AnimalChunk<
    T extends Partial<NodeDef> = NodeDef
> = NodeChunk<AnimalDef & T>

abstract class AnimalModel<
    T extends Partial<NodeDef> = NodeDef
> extends NodeModel<AnimalDef & T> {
    constructor(
        chunk: BaseNodeChunk<T> & NodeChunk<AnimalDef>,
        parent: NodeDef.Parent<AnimalDef & T>
    ) {
        super({
            ...chunk,
            child: {
                feat: { code: 'feat' },
                ...chunk.child
            },
            state: {
                isAlive: true,
                ...chunk.child
            }
        } as any, parent);
    }
}

type BunnyDef = {
    code: 'bunny',
    state: { name: string }
    parent: undefined
}
class BunnyModel extends NodeModel<BunnyDef> {
    constructor(
        chunk: AnimalChunk<BunnyDef>,
        parent: NodeDef.Parent<BunnyDef>
    ) {
        super({
            ...chunk,
            state: {
                name: 'anoymous',
                ...chunk.state
            },
            child: {}
        }, parent);
    }
}

const bunny: BunnyModel = new BunnyModel(
    {
        code: 'bunny',
        state: {
            isAlive: false,
            name: ''
        },
        child: {
            feat: { code: 'feat' }
        }
    }, 
    undefined
);
bunny.child.a;