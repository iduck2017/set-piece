/** model */

import { RequiredKeys } from "utility-types"

type BaseModel = Model<
    string[],
    Record<string, any>,
    Record<string, any>,
    Record<string, BaseModel> | BaseModel[],
    Record<string, BaseModel> | BaseModel[],
    BaseModel | null
>

type EventProducer<E = any, M extends BaseModel = BaseModel> = { target: M, key: string, path?: string[] }
type EventProducers<E extends Record<string, any>, M extends BaseModel> = { [K in keyof E]: EventProducer<E[K], M> }
type EventHandler<E = any, M extends BaseModel = BaseModel> = (target: M, event: E) => void
type EventEmitter<E> = (event: E) => void
type EventEmitters<E extends Record<string, any>> = { [K in keyof E]: EventEmitter<E[K]> }

type DecorReceiver<S = any, M extends BaseModel = BaseModel> = { target: M, key: string, path?: string[] }
type DecorReceivers<S extends Record<string, any>, M extends BaseModel> = { [K in keyof S]: DecorReceiver<S[K], M> }
type DecorUpdater<S = any, M extends BaseModel = BaseModel> = (target: M, prev: S) => S


type OnStateChange<M extends BaseModel> = { statePrev: Model.State<M>, stateNext: Model.State<M> }
type OnChildChange<M extends BaseModel> = { childPrev: Model.Child<M>, childNext: Model.Child<M> }
type OnReferChange<M extends BaseModel> = { referPrev: Model.Refer<M>, referNext: Model.Refer<M> }
type BaseEvent<M extends BaseModel> = { 
    onStateChange: OnStateChange<M>, 
    onChildChange: OnChildChange<M>, 
    onReferChange: OnReferChange<M> 
}

type ChildProps<C extends Record<string, BaseModel> | BaseModel[]> =
    C extends Record<string, any> ?
        { [K in RequiredKeys<C>]: Model.Props<Required<C>[K]> } & 
        { [K in keyof C]?: Model.Props<Required<C>[K]> } : 
    C extends any[] ? Model.Props<C[number]>[] : never

type ReferProps<R extends Record<string, BaseModel> | BaseModel[]> = 
    R extends Record<string, any> ?
        { [K in RequiredKeys<R>]: string[] } & 
        { [K in keyof R]?: string[] } : 
        string[][]

type BaseProps<
    S extends Record<string, any>,
    C extends Record<string, BaseModel> | BaseModel[],
    R extends Record<string, BaseModel> | BaseModel[],
    P extends BaseModel | null
> = {
    uuid?: string;
    state: S;
    child: ChildProps<C>;
    refer: ReferProps<R>;
    parent: P;
}

type Chunk<
    I extends string[],
    S extends Record<string, any>,
    C extends Record<string, BaseModel> | BaseModel[],
    R extends Record<string, BaseModel> | BaseModel[]
> = {
    code: I;
    uuid: string;
    state: S;
    child: ChildProps<C>;
    refer: ReferProps<R>;
}

type Props<
    I extends string[],
    S extends Record<string, any>,
    C extends Record<string, BaseModel> | BaseModel[],
    R extends Record<string, BaseModel> | BaseModel[],
> = {
    code: I;
    uuid?: string;
    state?: Partial<S>;
    child?: Partial<ChildProps<C>>;
    refer?: Partial<ReferProps<R>>;
}

export namespace Model {
    export type State<M extends BaseModel> = M['state']
    export type Child<M extends BaseModel> = M['child']
    export type Refer<M extends BaseModel> = M['refer']
    export type Props<M extends BaseModel> = M['props']
}

export class Model<
    I extends string[],
    S extends Record<string, any> = {},
    E extends Record<string, any> = {},
    C extends Record<string, BaseModel> | BaseModel[] = {},
    R extends Record<string, BaseModel> | BaseModel[] = {},
    P extends BaseModel | null = BaseModel,
    A extends BaseModel = never
> {
    readonly uuid!: string;
    readonly path!: string[];
    readonly code!: I;

    state!: Readonly<S>
    private stateCache!: S;
    protected stateProxy!: S;

    decor!: Readonly<DecorReceivers<S, this>>
    private decorProviders!: Map<DecorUpdater, BaseModel>;
    private decorReceivers!: Map<DecorUpdater, DecorReceiver[]>;
    private decorUpdaters!: Map<DecorReceiver, DecorUpdater[]>;
    
    child!: Readonly<C>
    private childCache!: C;
    protected childProxy!: ChildProps<C>;

    
    parent: P;
    root: BaseModel;

    refer!: Readonly<R>
    private referCache!: R;
    protected referProxy!: ReferProps<R>;
    
    event!: Readonly<EventProducers<E & BaseEvent<this>, this>>
    private eventConsumers!: Map<EventHandler, BaseModel>
    private eventProducers!: Map<EventHandler, EventProducer[]>
    private eventHandlers!: Map<EventProducer, EventHandler[]>
    protected eventEmitters!: EventEmitters<E>

    constructor(props: BaseProps<S, C, R, P>) {
        this.uuid = props.uuid || '';

        this.parent = props.parent;
        this.root = this.parent?.root || this;
        
        const referOrigin: any = {};


        this.referCache = new Proxy(referOrigin, {
            get: this.getRefer.bind(this),
        })
        this.referProxy = new Proxy(props.refer, {
            set() { return true /** referChange */ },
            deleteProperty() { return true /** referChange */ },
        })
        
        // this.childProxy = new Proxy(props.child, {
        //     get(origin, key) {
        //         /** array operation delegator */
        //     },
        //     set() { return true /** childChange */ },
        //     deleteProperty() { return true /** childChange */ },
        // })
    }

    private getRefer(origin: R, key: string) {
        const value = Reflect.get(origin, key);
        if (!value) {
            const path = Reflect.get(this.referProxy, key);
            if (!(path instanceof Array)) return undefined;
            const target = this.root.queryChild(path)
            Reflect.set(origin, key, target);
        }
        return value;
    }
    
    private setRefer(origin: ReferProps<R>, key: string, value: any) {

    }


    test() {
        this.event.onChildChange;
        this.event.onReferChange;
        this.event.onStateChange;
    }


    queryChild(path?: string[]): BaseModel | undefined {
        if (!path) return undefined;


    }

    get chunk(): Readonly<Chunk<I, S, C, R>> {
        return {
            code: this.code,
            uuid: this.uuid,
            state: this.stateProxy,
            child: this.childProxy,
            refer: this.referProxy,
        }
    }

    get props(): Readonly<Props<I, S, C, R>> {
        return {
            code: this.code,
            state: this.stateProxy,
            child: this.childProxy,
            refer: this.referProxy,
        }
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

/** human */

type BaseHumanModel = HumanModel<
    HumanCode,
    Record<string, any>,
    Record<string, any>,
    Record<string, BaseModel>,
    Record<string, BaseModel>,
    BaseModel
>
type HumanCode = [...string[], 'human']
type HumanEvent = { onGrow: void, onDie: void, onHello: BaseHumanModel }
type HumanState = { age: number, isAlive: boolean, name: string }
type HumanChild = { son: ThinkpolModel, daughter?: BaseHumanModel }
type HumanRefer = { friend: BaseHumanModel, enemy?: BaseHumanModel }

abstract class HumanModel<
    I extends HumanCode,
    S extends Partial<HumanState> & Record<string, any>,
    E extends Partial<HumanEvent> & Record<string, any>,
    C extends Partial<HumanChild> & Record<string, BaseModel>,
    R extends Partial<HumanRefer> & Record<string, BaseModel>,
    P extends BaseModel,
> extends Model<
    I,
    S & HumanState, 
    E & HumanEvent,
    C & HumanChild, 
    R & HumanRefer,
    P
> {
    test() {
        this.state.age;
        this.state.isAlive;
        this.child.son;
        this.child.daughter;
        this.childProxy.son = {
            code: ['thinkpol', 'outerparty', 'human'],
            uuid: '123',
            state: { age: 10, alias: 'a' },
            child: {},
            refer: {},
        }
        this.childProxy.son?.state?.age;
        this.childProxy.daughter?.state?.name;
        this.refer.friend;
        this.event.onGrow;
        this.eventEmitters.onGrow(undefined)
        this.eventEmitters.onHello(this)
    }

    @Model.useEvent((model) => model.event.onStateChange)
    private _onStateChange(target: BaseHumanModel, event: OnStateChange<this>) {

    }

    @Model.useEvent((model) => model.event.onGrow)
    private _onGrow(target: BaseHumanModel, event: void) {

    }

    @Model.useEvent((model) => model.event.onHello)
    private _onHello(target: BaseHumanModel, event: BaseHumanModel) {
        
    }
    
}


/** outerparty */

type OuterPartyCode = [...string[], 'outerparty', 'human']
type OuterPartyState = Partial<HumanState> & { salary: number }
type OuterPartyChild = Partial<HumanChild> & {}
type OuterPartyEvent = Partial<HumanEvent> & { onReport: BaseOuterPartyModel, onWork: void }
type OuterPartyRefer = Partial<HumanRefer> & { coworker: BaseOuterPartyModel }

type BaseOuterPartyModel = OuterPartyModel<
    OuterPartyCode,
    Record<string, any>,
    Record<string, any>,
    Record<string, BaseModel>,
    Record<string, BaseModel>,
    BaseModel
>

class OuterPartyModel<
    I extends OuterPartyCode,
    S extends Partial<OuterPartyState> & Record<string, any>,
    E extends Partial<OuterPartyEvent> & Record<string, any>,
    C extends Partial<OuterPartyChild> & Record<string, BaseModel>,
    R extends Partial<OuterPartyRefer> & Record<string, BaseModel>,
    P extends BaseModel
> extends HumanModel<
    I,
    S & OuterPartyState,
    E & OuterPartyEvent,
    C & OuterPartyChild,
    R & OuterPartyRefer,
    P
> {
    test() {
        this.child.daughter;
        this.state.salary;
        this.child.son;
        this.refer.coworker;
        this.eventEmitters.onReport(this.refer.coworker);
        this.eventEmitters.onDie(undefined);
        this.eventEmitters.onWork(undefined);
        this.state.age;
        this.state.isAlive;
        this.state.name;
    }
}

/** mechanic */

type ThinkpolCode = ['thinkpol', 'outerparty', 'human']
type ThinkpolState = { alias: string }
type ThinkpolChild = { foo: BaseOuterPartyModel }
type ThinkpolEvent = { onWatch: BaseOuterPartyModel }
type ThinkpolRefer = { target: BaseOuterPartyModel }

class ThinkpolModel extends OuterPartyModel<
    ThinkpolCode,
    ThinkpolState,
    ThinkpolEvent,
    ThinkpolChild,
    ThinkpolRefer,
    BaseModel
> {
    test(): void {
        this.state.isAlive;
        this.state.alias;
        this.refer.coworker;
        this.refer.target;
        this.eventEmitters.onWatch(this.refer.target);
        this.childProxy.son = {
            code: ['thinkpol', 'outerparty', 'human'],
            state: {
                alias: 'aaa',
                isAlive: true,
            }
        }
        this.child.son.code
        this.childProxy.foo;
        this.childProxy.foo.state?.age;
        this.childProxy.foo.state?.salary;
        
    }
    
}
