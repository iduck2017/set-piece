import { Agent } from "./agent"
import { ChildChunk, Chunk, ReferAddrs } from "./chunk"
import { DecorReceiver, DecorReceivers, DecorUpdater } from "./decor"
import { BaseEvent, EventEmitters, EventHandler, EventProducer, EventProducers } from "./event"
import { Props, StrictProps } from "./props"
import { BaseValue } from "./types"

type BaseModel = Model<{}, {}, {}, {}, BaseModel | undefined, BaseModel, {}, BaseModel>

export namespace Model {
    export type Props<M extends Model> = M['props']
    export type Chunk<M extends Model> = M['chunk']
    export type Agent<M extends Model> = M['agent']
    export type State<M extends Model> = M['state']
    export type Child<M extends Model> = M['child']
    export type Refer<M extends Model> = M['refer']
    export type ChildGroup<M extends Model> = M['childGroup']
    export type ReferGroup<M extends Model> = M['referGroup']
}

export abstract class Model<
    E extends Record<string, any> = {},
    S extends Record<string, BaseValue> = {},
    D extends Record<string, BaseValue> = {},
    C extends Record<string, Model> = {},
    P extends Model | undefined = BaseModel | undefined,
    I extends Model = BaseModel,
    R extends Record<string, Model> = {},
    Q extends Model = BaseModel
> {
    readonly state!: Readonly<S & D>
    private readonly stateOrigin!: S & D
    protected readonly stateAgent!: S & D

    readonly child!: Readonly<C>;
    private readonly childOrigin!: Readonly<C>;
    protected readonly childAgent!: ChildChunk<C>;
    
    readonly childGroup!: Readonly<I[]>;
    private readonly childGroupOrigin!: Readonly<I[]>;
    protected readonly childGroupAgent!: Model.Chunk<I>[];

    readonly parent: P;
    readonly root: Model;

    readonly event: Readonly<EventProducers<E & BaseEvent<this>, this>>;
    readonly eventEmitter!: Readonly<EventEmitters<E>>;
    private readonly eventConsumers: Map<EventHandler, Model>
    private readonly eventRouter: Map<EventProducer, EventHandler[]>
    private readonly eventInvertRouter: Map<EventHandler, EventProducer[]>

    readonly decor: Readonly<DecorReceivers<S, this>>;
    private readonly decorProviders: Map<DecorReceiver, Model>
    private readonly decorRouter: Map<DecorReceiver, DecorUpdater[]>
    private readonly decorInvertRouter: Map<DecorUpdater, DecorReceiver[]>

    readonly uuid: string;
    readonly uuidPath: string[];

    readonly refer!: Readonly<R>;
    private readonly referOrigin!: ReferAddrs<R>;
    protected readonly referAgent!: R;

    readonly referGroup!: Readonly<Q[]>;
    private readonly referGroupOrigin!: string[][];
    protected readonly referGroupAgent!: Q[];

    readonly agent!: Agent<E, S, C, I, this>
    readonly props!: Readonly<Props<S, D, C, P, I, R>>;
    readonly chunk!: Readonly<Chunk<S, D, C, P, I, R, this>>;
    
    constructor(props: StrictProps<S, D, C, P, I, R>) {
        this.eventConsumers = new Map()
        this.eventRouter = new Map()
        this.eventInvertRouter = new Map()
        this.decorProviders = new Map()
        this.decorRouter = new Map()
        this.decorInvertRouter = new Map()
        this.parent = props.parent;
        this.root = this.parent?.root ?? this;
        this.uuid = props.uuid;
        this.uuidPath = [...this.parent?.uuidPath ?? [], this.uuid];
        this.event = new Proxy({} as any, { get: this.getEvent.bind(this) });
        this.decor = new Proxy({} as any, { get: this.getDecor.bind(this) });
    }

    private getEvent(origin: Record<string, EventProducer>, key: string) {
        if (!origin[key]) origin[key] = new EventProducer(this, key);
        return origin[key];
    }

    private getDecor(origin: Record<string, DecorReceiver>, key: string) {
        if (!origin[key]) origin[key] = new DecorReceiver(this, key);
        return origin[key];
    }

    protected bindEvent<E, M extends Model>(
        event: EventProducer<E, M>,
        handler: EventHandler<E, M>
    ) {
        console.log(event, handler)
    }

    protected static useEvent<E, M extends Model>(accessor: (model: M) => EventProducer<E, M> | undefined) {
        return function(
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<EventHandler<E, M>>
        ): TypedPropertyDescriptor<EventHandler<E, M>> {
            return descriptor;
        };
    }

    
    protected static useDecor<S, M extends Model>(accessor: (model: M) => DecorReceiver<S, M> | undefined) {
        return function(
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<DecorUpdater<S, M>>
        ): TypedPropertyDescriptor<DecorUpdater<S, M>> {
            return descriptor;
        };
    }
    
}
