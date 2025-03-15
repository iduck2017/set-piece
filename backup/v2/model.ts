import { Agent } from "./agent";
import { ChildChunk, ChildGroupChunk, Chunk } from "./chunk";
import { DecorReceiver, DecorReceivers, DecorUpdater } from "./decor";
import { SuperDef, Def } from "./define";
import { EventEmitters, EventHandler, EventProducer, EventProducers } from "./event";
import { BaseProps, Props } from "./props";
import { ReferAddrs, ReferGroupAddrs } from "./refer";

export class BaseModel<T extends Def = Def> {
    readonly state!: Readonly<Def.State<T> & Def.StateInner<T>>
    private stateOrigin!: Def.State<T> & Def.StateInner<T>
    protected stateAgent!: Def.State<T> & Def.StateInner<T>

    readonly child!: Readonly<Def.Child<T>>
    private childOrigin!: Def.Child<T>
    protected childAgent!: ChildChunk<T>
    
    readonly event!: EventProducers<T, this>
    protected eventEmitters!: EventEmitters<T>
    private eventConsumers!: Map<EventHandler, BaseModel>
    private eventForward!: Map<EventHandler, EventProducer[]>
    private eventBacktrack!: Map<EventProducer, EventHandler[]>

    readonly decor!: DecorReceivers<T, this>
    protected decorProviders!: Map<DecorReceiver, BaseModel>;
    private decorReceivers!: Map<DecorUpdater, DecorReceivers<T, this>>;

    readonly refer!: Def.Refer<T>;
    private refOrigin!: ReferAddrs<T>;
    protected referAgent!: Def.Refer<T>;

    readonly referGroup!: Def.ReferGroup<T>;
    private refGroupOrigin!: ReferGroupAddrs<T>;
    protected referGroupAgent!: Def.ReferGroup<T>;

    readonly childGroup!: Def.ChildGroup<T>;
    private childGroupOrigin!: Def.ChildGroup<T>;
    protected childGroupAgent!: ChildGroupChunk<T>;

    readonly props!: Props<T>
    readonly chunk!: Chunk<T>

    readonly agent!: Agent<T, this>

    readonly uuid: string;
    readonly code: string;

    readonly parent: Def.Parent<T>

    constructor(props: BaseProps<T>) {
        this.parent = props.parent;
        this.uuid = props.uuid;
        this.code = props.code;
    }

    protected bindEvent<E, M extends BaseModel>(
        event: EventProducer<E, M>,
        handler: EventHandler<E, M>
    ) {

    }

    protected static useEvent<E, M extends BaseModel>(
        accessor: (model: M) => EventProducer<E, M> | undefined
    ) {
        return function(
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<EventHandler<E, M>>
        ): TypedPropertyDescriptor<EventHandler<E, M>> {
            return descriptor;
        };
    }
}

export class Model<T extends Partial<Def>> extends BaseModel<T & {
    code: string;
    state: {},
    child: {},
    refer: {},
    event: {},
    stateInner: {},
    referGroup: {},
    childGroup: {},
    parent: BaseModel | undefined
}> {}

export namespace Model {
    export type Chunk<M extends BaseModel> = M['chunk']
    export type Props<M extends BaseModel> = M['props']
    export type State<M extends BaseModel> = M['state']
    export type Child<M extends BaseModel> = M['child']
    export type Refer<M extends BaseModel> = M['refer']
    export type ReferGroup<M extends BaseModel> = M['referGroup']
    export type ChildGroup<M extends BaseModel> = M['childGroup']
    export type Parent<M extends BaseModel> = M['parent']
    export type Agent<M extends BaseModel> = M['agent']
}

