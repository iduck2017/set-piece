export type EventHandler<E = any, M extends Model = Model> = (target: M, event: E) => void

export class EventProducer<E = any, M extends Model = Model> { target!: M; key!: string; path?: string[] }
export type EventProducers<E extends Record<string, any>, M extends Model> = { [K in keyof E]: EventProducer<Required<E>[K], M> }

export type EventEmitter<E> = (event: E) => void
export type EventEmitters<E extends Record<string, any>> = { [K in keyof E]: EventEmitter<Required<E>[K]> }

export type PrimitiveValue = string | number | boolean | undefined;
export type BaseValue = PrimitiveValue | PrimitiveValue[] | Record<string, PrimitiveValue>;

type BaseModel = Model<{}, {}, {}, {}, BaseModel | undefined, BaseModel, {}, BaseModel>

export class DecorReceiver<S = any, M extends Model = Model> { target!: M; key!: keyof S; path?: string[] }
// export type DecorReceiver<S = any, M extends Model = Model> = { target: M, key: keyof S, path?: string[] }
export type DecorReceivers<S extends Record<string, any>, M extends Model = Model> = { [K in keyof S]: DecorReceiver<Required<S>[K], M> }

export type DecorUpdater<S = any, M extends Model = Model> = (target: M, state: S) => S

export type Props<
    S extends Record<string, BaseValue>,
    D extends Record<string, BaseValue>,
    C extends Record<string, Model>,
    P extends Model | undefined,
    I extends Model,
    R extends Record<string, Model>,
> = {
    uuid: string;
    state?: Partial<S & D>;
    child?: Partial<ChildChunk<C>>;
    childGroup?: Model.Chunk<I>[];
    parent: P;
    refer?: Partial<ReferAddrs<R>>;
    referGroup?: string[][];
}

export type Chunk<
    S extends Record<string, BaseValue>,
    D extends Record<string, BaseValue>,
    C extends Record<string, Model>,
    P extends Model | undefined,
    I extends Model,
    R extends Record<string, Model>,
    M extends Model,
> = {
    type: new (props: any) => M;
    uuid?: string;
    state?: Partial<S & D>;
    child?: Partial<ChildChunk<C>>;
    childGroup?: Model.Chunk<I>[];
    refer?: Partial<ReferAddrs<R>>;
    referGroup?: string[][];
}

export type StrictChunk<
    S extends Record<string, BaseValue>,
    D extends Record<string, BaseValue>,
    C extends Record<string, Model>,
    P extends Model | undefined,
    I extends Model,
    R extends Record<string, Model>,
    M extends Model,
> = {
    type: new (props: any) => M;
    uuid: string;
    state: S & D;
    child: ChildChunk<C>;
    childGroup: Model.Chunk<I>[];
    refer: ReferAddrs<R>;
    referGroup: string[][];
}

export type StrictProps<
    S extends Record<string, BaseValue>,
    D extends Record<string, BaseValue>,
    C extends Record<string, Model>,
    P extends Model | undefined,
    I extends Model,
    R extends Record<string, Model>,
> = {
    uuid: string;
    state: S & D;
    child: ChildChunk<C>;
    childGroup: Model.Chunk<I>[];
    parent: P;
    refer: ReferAddrs<R>;
    referGroup: string[][];
}

export type ReferAddrs<C extends Record<string, Model>> = C extends C ? { [K in keyof C]: C[K] extends Model ? string[] : string[] | undefined } : never;
export type ChildChunk<C extends Record<string, Model>> = C extends C ? { [K in keyof C]: C[K] extends Model ? Model.Chunk<C[K]> : Model.Chunk<Required<C>[K]> | undefined } : never;
export type ChildAgent<C extends Record<string, Model>> = C extends C ? { [K in keyof C]: Model.Agent<Required<C>[K]> } : never;

export class Agent<
    E extends Record<string, BaseValue>,
    S extends Record<string, BaseValue>,
    C extends Record<string, Model>,
    I extends Model,
    M extends Model
> {
    readonly child!: ChildAgent<C>;
    readonly childGroup!: Model.Agent<I>;
    readonly event!: EventProducers<E, M>;
    readonly decor!: DecorReceivers<S, M>;
}

export namespace Model {
    export type Props<M extends Model> = M['props']
    export type Chunk<M extends Model> = M['chunk']
    export type Agent<M extends Model> = M['agent']
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

    readonly parent!: P;

    readonly event!: Readonly<EventProducers<E, this>>;
    readonly eventEmitter!: Readonly<EventEmitters<E>>;
    private readonly eventConsumers: Map<EventHandler, Model>
    private readonly eventRouter: Map<EventProducer, EventHandler[]>
    private readonly eventInvertRouter: Map<EventHandler, EventProducer[]>

    readonly decor!: Readonly<DecorReceivers<S, this>>;
    private readonly decorProviders: Map<DecorReceiver, Model>
    private readonly decorRouter: Map<DecorReceiver, DecorUpdater[]>
    private readonly decorInvertRouter: Map<DecorUpdater, DecorReceiver[]>

    readonly uuid!: string;
    readonly uuidPath!: string[];

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
    }

    test() {
        const model: Model = this
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

export namespace PetDefine {
    export type Event = { onBorn: void; onPlay: HumanModel; onFight: PetModel }
    export type State = { name?: string };
    export type StateInner = { age: number, isAlive: boolean };
    export type Child = {};
    export type ChildGroup = Model;
    export type Parent = HumanModel;
}


export class PetModel extends Model<
    PetDefine.Event,
    PetDefine.State,
    PetDefine.StateInner,
    PetDefine.Child,
    PetDefine.Parent,
    PetDefine.ChildGroup
> {
    test() {
        const pet: PetModel = this;
        const age: number = pet.state.age;
        const isAlive: boolean = pet.state.isAlive;
        const name: string = pet.state.name ?? '';
        pet.stateAgent.age += 10;
        pet.stateAgent.isAlive = true;
        pet.stateAgent.name = 'Tom';
        this.parent;
        this.eventEmitter.onBorn();
        this.eventEmitter.onPlay(this.parent);
        this.eventEmitter.onFight(this)
    }
}

export namespace HumanDefine {
    export type Event = { onBorn: void; onSpeek: string; onHello: HumanModel, onCount: number }
    export type State = { nickname?: string, emotion: string }
    export type StateInner = { isAlive: boolean, age: number, name: string }
    export type Child = { cat?: PetModel }
    export type Parent = HumanModel;
    export type ChildGroup = HumanModel;
    export type Refer = { father?: HumanModel, mother: HumanModel }
    export type ReferGroup = HumanModel;
}

export abstract class HumanModel<
    E extends Partial<HumanDefine.Event> = {},
    S extends Partial<HumanDefine.State> = {},
    D extends Partial<HumanDefine.StateInner> = {},
    C extends Partial<HumanDefine.Child> = {},
    P extends HumanDefine.Parent = HumanDefine.Parent,
    I extends HumanDefine.ChildGroup = HumanDefine.ChildGroup,
    R extends Partial<HumanDefine.Refer> = {},
    Q extends HumanDefine.ReferGroup = HumanDefine.ReferGroup
> extends Model<
    E & HumanDefine.Event,
    S & HumanDefine.State,
    D & HumanDefine.StateInner,
    C & HumanDefine.Child,
    P,
    I,
    R & HumanDefine.Refer,
    Q
> {
    test() {
        const human: HumanModel = this;
        const age: number = human.state.age;
        const isAlive: boolean = human.state.isAlive;
        const name: string = human.state.name;
        const nickname: string = human.state.nickname ?? '';
        const emotion: string = human.state.emotion;
        human.stateAgent.age += 10;
        human.stateAgent.emotion = 'happy';
        human.stateAgent.isAlive = true;
        human.stateAgent.nickname = '';
        this.eventEmitter.onBorn(undefined);
        this.eventEmitter.onSpeek('Hello');
        this.eventEmitter.onCount(4);
        this.eventEmitter.onHello(this.parent);
        const cat: PetModel | undefined = this.child.cat;
        this.childAgent.cat?.state?.age;
        this.child.cat?.state.age;
        this.childAgent.cat = { type: PetModel };
        const employee: HumanModel = this.childGroup[0];
        this.childGroupAgent.push({ type: ThinkPolModel });
        const father: HumanModel | undefined = this.refer.father;
        const mother: HumanModel = this.refer.mother;
        const friends: HumanModel = this.referGroup[0];
        this.referAgent.father = human.refer.father;
        this.referAgent.mother = human.refer.mother;
        // this.referGroupAgent.push(human);
        this.eventEmitter.onCount(4)
    }
    
    @Model.useDecor((model: HumanModel) => model.decor.nickname)
    onAgeCheck(target: HumanModel, state: string) { return state }

    @Model.useEvent((model) => model.event.onHello)
    onBorn(target: HumanModel, event: HumanModel) {}

    @Model.useEvent((model) => model.agent.event.onHello)
    onBorn2(target: HumanModel, to: HumanModel) {}

    @Model.useEvent((model: HumanModel) => model.agent.childGroup.event.onHello)
    onBorn3(target: HumanModel, to: HumanModel) {}
}

export namespace OuterPartyDefine {
    export type Event = Partial<HumanDefine.Event> & { onWork: void; onReport: OuterPartyModel };
    export type State = Partial<HumanDefine.State> & { salary: number };
    export type StateInner = Partial<HumanDefine.StateInner> & { seniority: number };
    export type Child = Partial<HumanDefine.Child> & { cat: PetModel, dog?: PetModel };
    export type Parent = OuterPartyModel;
    export type ChildGroup = OuterPartyModel;
    export type Refer = Partial<HumanDefine.Refer> & { father: OuterPartyModel, introducer: OuterPartyModel };
    export type ReferGroup = OuterPartyModel;
}

export class OuterPartyModel<
    E extends Partial<OuterPartyDefine.Event> = {},
    S extends Partial<OuterPartyDefine.State> = {},
    D extends Partial<OuterPartyDefine.StateInner> = {},
    C extends Partial<OuterPartyDefine.Child> = {},
    P extends OuterPartyDefine.Parent = OuterPartyDefine.Parent,
    I extends OuterPartyDefine.ChildGroup = OuterPartyDefine.ChildGroup,
    R extends Partial<OuterPartyDefine.Refer> = {},
    Q extends OuterPartyDefine.ReferGroup = OuterPartyDefine.ReferGroup
> extends HumanModel<
    E & OuterPartyDefine.Event,
    S & OuterPartyDefine.State,
    D & OuterPartyDefine.StateInner,
    C & OuterPartyDefine.Child,
    P,
    I,
    R & OuterPartyDefine.Refer,
    Q
> {
    test() {
        const model: Model = this;
        const human: HumanModel = this;
        const emotion: string = this.state.emotion;
        const outerParty: OuterPartyModel = this;
        const salarty: number = this.state.salary;
        const seniority: number = this.state.seniority;
        const dog: PetModel | undefined = this.child.dog;
        const cat: PetModel = this.child.cat;
        this.childAgent.dog?.state?.age;
        this.child.dog?.state.age;
        this.eventEmitter.onWork(undefined)
        this.eventEmitter.onReport(this.parent)
        const introducer: OuterPartyModel = this.refer.introducer;
        const introducer2: OuterPartyModel = this.referAgent.introducer;
        this.referAgent.introducer = this.refer.father;
        const friend: OuterPartyModel = this.referGroup[0];
    }
}

export namespace ThinkPolDefine {
    export type Event = Partial<OuterPartyDefine.Event> & { onSpy: OuterPartyModel }
    export type State = Partial<OuterPartyDefine.State> & { alias: string }
    export type StateInner = Partial<OuterPartyDefine.StateInner>
    export type Child = Partial<OuterPartyDefine.Child> & { dog: PetModel }
    export type Parent = OuterPartyModel 
    export type ChildGroup = OuterPartyModel
    export type Refer = Partial<OuterPartyDefine.Refer> & { target: OuterPartyModel }
    export type ReferGroup = OuterPartyModel
}

export class ThinkPolModel extends OuterPartyModel<
    ThinkPolDefine.Event,
    ThinkPolDefine.State,
    ThinkPolDefine.StateInner,
    ThinkPolDefine.Child,
    ThinkPolDefine.Parent,
    ThinkPolDefine.ChildGroup,
    ThinkPolDefine.Refer,
    ThinkPolDefine.ReferGroup
> {
    test() {
        const dog: PetModel = this.child.dog;
        this.childAgent.dog = { type: PetModel };
        this.child.cat?.state.age;
        const model: Model = this;
        const outerParty: OuterPartyModel = this;
        const human: HumanModel = this
        this.eventEmitter.onHello(human);
        this.eventEmitter.onSpy(this);
        this.eventEmitter.onBorn();
        const cat: PetModel = this.child.cat;
    }

    
    @Model.useEvent((model) => model.event.onCount)
    onBorn4(target: HumanModel, event: number) {}

    @Model.useEvent((model) => model.agent.event.onHello)
    onBorn5(target: HumanModel, to: HumanModel) {}

    @Model.useEvent((model: HumanModel) => model.agent.childGroup.event.onHello)
    onBorn6(target: HumanModel, to: HumanModel) {}
}
