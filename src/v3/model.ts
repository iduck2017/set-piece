import { Agent } from "./agent";
import { ChildChunk, ChildGroupChunk, Chunk } from "./chunk";
import { BaseValue } from "./common";
import { DecorReceiver, DecorReceivers, DecorUpdater } from "./decor";
import { EventEmitters, EventHandler, EventProducer, EventProducers } from "./event";
import { BaseProps, Props } from "./props";
import { ReferAddrs, ReferGroupAddrs } from "./refer";

export class Model<
    I extends string,
    E extends Record<string, any> = {},
    S extends Record<string, BaseValue> = {},
    D extends Record<string, BaseValue> = {},
    C extends Record<string, BaseModel> = {},
    G extends Record<string, BaseModel[]> = {},
    R extends Record<string, BaseModel> = {},
    Q extends Record<string, BaseModel[]> = {},
    P extends BaseModel | undefined = BaseModel,
> {
    readonly state!: Readonly<S & D>
    private stateOrigin!: S & D
    protected stateAgent!: S & D

    readonly child!: Readonly<C>
    private childOrigin!: C
    protected childAgent!: ChildChunk<C>
    
    readonly event!: EventProducers<E, this>
    protected eventEmitters!: EventEmitters<E>
    private eventConsumers!: Map<EventHandler, BaseModel>
    private eventForward!: Map<EventHandler, EventProducer[]>
    private eventBacktrack!: Map<EventProducer, EventHandler[]>

    readonly decor!: DecorReceivers<D, this>
    protected decorProviders!: Map<DecorReceiver, BaseModel>;
    private decorReceivers!: Map<DecorUpdater, DecorReceivers<D, this>>;

    readonly refer!: R;
    private refOrigin!: ReferAddrs<R>;
    protected referAgent!: R;

    readonly referGroup!: Q;
    private referGroupOrigin!: ReferGroupAddrs<Q>;
    protected referGroupAgent!: Q;

    readonly childGroup!: G;
    private childGroupOrigin!: G;
    protected childGroupAgent!: ChildGroupChunk<G>;

    readonly props!: Props<I, S, D, C, G, P>
    readonly chunk!: Chunk<I, S, D, C, G>

    readonly agent!: Agent<E, C, G, D, this>

    readonly uuid: string;
    readonly code: string;

    readonly parent: P

    constructor(props: BaseProps<I, S, D, C, G, P>) {
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

export type BaseModel = Model<
    string,
    {},
    {},
    {},
    {},
    {},
    {},
    {},
    BaseModel | undefined
>

// export class Model<T extends Partial<Def>> extends BaseModel<T & {
//     code: string;
//     state: {},
//     child: {},
//     refer: {},
//     event: {},
//     stateInner: {},
//     referGroup: {},
//     childGroup: {},
//     parent: BaseModel | undefined
// }> {}

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

