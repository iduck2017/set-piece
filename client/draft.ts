import { Assign, OptionalKeys, Overwrite, RequiredKeys } from "utility-types";
import { Strict, KeyOf, Base } from "./type/base";

type Def = {
    code: string,
    state: Base.Dict<Base.Value>
    event: Base.Dict<any> 
    child: Base.Dict<NodeModel>
    parent?: NodeModel
}

type PureDef = {
    code: never;
    state: Base.Dict<never>
    event: Base.Dict<never>
    child: Base.Dict<never>
    parent: NodeModel
}

type MergeOf<
    A extends Base.Dict,
    B extends Base.Dict,
> = A & Omit<B, KeyOf<A>>

export type Valid<M extends Base.Dict> = {
    [K in RequiredKeys<M> as M[K] extends never ? never : K]: M[K]
} & {
    [K in OptionalKeys<M> as M[K] extends never ? never : K]?: M[K]
}

namespace Def {
    export type Code<A extends Partial<Def>> = MergeOf<A, PureDef>['code'];
    export type State<A extends Partial<Def>> = MergeOf<A, PureDef>['state'];
    export type Event<A extends Partial<Def>> = MergeOf<A, PureDef>['event'];
    export type Child<A extends Partial<Def>> = MergeOf<A, PureDef>['child'];
    export type Parent<A extends Partial<Def>> = MergeOf<A, PureDef>['parent'];
}

export type ChildNodeChunk<T extends Partial<Def>> = 
    {
        [K in RequiredKeys<Valid<Def.Child<T>>>]: 
            NodeModel.Chunk<Def.Child<T>[K]>
    } & {
        [K in OptionalKeys<Valid<Def.Child<T>>>]?: 
            NodeModel.Chunk<Required<Def.Child<T>>[K]>; 
    }

type BaseChunk<
    A extends Partial<Def>,
    B extends Def
> = {
    code: Def.Code<A> & Partial<Def.Code<B>>;
    state: Strict<Def.State<A> & Partial<Def.State<B>>>;
    child: Strict<ChildNodeChunk<A> & Partial<ChildNodeChunk<B>>>
}

type NodeChunk<T extends Partial<Def>> = {
    code: Def.Code<T>;
    state?: Partial<Def.State<T>>;
    child?: Partial<Strict<ChildNodeChunk<T>>>
}

namespace NodeModel {
    export type Chunk<M extends NodeModel> = M['chunk']
}

class NodeModel<T extends Partial<Def> = Def> {
    code!: Def.Code<T>;
    uuid!: string;
    parent!: Def.Parent<T>;

    _state!: Strict<Def.State<T>>;
    state!: Readonly<Strict<Def.State<T>>>;
    
    _child!: Strict<ChildNodeChunk<T>>;
    child!: Readonly<Strict<Def.Child<T>>>;

    chunk!: NodeChunk<T>;

    constructor(
        chunk: BaseChunk<T, Def>,
        parent: Def.Parent<T>
    ) {
        
    }
}

type FeatDef = { code: 'feat' }
class FeatModel extends NodeModel<FeatDef> {
    constructor(
        chunk: NodeChunk<FeatDef>,
        parent: Def.Parent<FeatDef>
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
    },
    event: {},
}
abstract class AnimalModel<
    T extends Partial<Def> = Def
> extends NodeModel<AnimalDef & T> {
    constructor(
        chunk: BaseChunk<T, AnimalDef>,
        parent: Def.Parent<AnimalDef & T>
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
        }, parent);
    }
}

type BunnyDef = {
    code: 'bunny',
    state: { name: string }
    parent: undefined
}
class BunnyModel extends NodeModel<BunnyDef> {
    constructor(
        chunk: NodeChunk<BunnyDef & AnimalDef>,
        parent: Def.Parent<BunnyDef>
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


