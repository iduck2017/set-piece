import { Agent } from "./agent"
import { ReferAddrs, ReferGroup } from "../types/refer"
import { Chunk, StrictChunk, ChildChunk } from "../types/chunk"
import { DecorReceivers } from "../types/decor"
import { BaseEvent, EventEmitters, EventProducers } from "../types/event"
import { Props, StrictProps } from "../types/props"
import { Value } from "../types"
import { ProductContext } from "@/context/product"
import { DebugContext } from "@/context/debug"
import { TrxContext } from "@/context/trx"
import { EventModel } from "@/submodel/event"
import { StateModel } from "@/submodel/state"
import { DecorModel } from "@/submodel/decor"
import { ChildModel } from "@/submodel/child"

type BaseModel = Model<string, {}, {}, {}, BaseModel | undefined, {}, BaseModel, {}, {}>

export namespace Model {
    export type Props<M extends Model> = M['props']
    export type Chunk<M extends Model> = M['chunk']
    export type Agent<M extends Model> = M['agent']
    export type State<M extends Model> = M['state']
    export type Child<M extends Model> = M['child']
    export type Refer<M extends Model> = M['refer']
}

export abstract class Model<
    I extends string = string,
    E extends Record<string, any> = {},
    S1 extends Record<string, Value> = {},
    S2 extends Record<string, Value> = {},
    P extends Model | undefined = BaseModel | undefined,
    C1 extends Record<string, Model> = {},
    C2 extends Model = BaseModel,
    R1 extends Record<string, Model> = {},
    R2 extends Record<string, Model> = {}
> {
    public stateModel: StateModel<S1, S2, this>;
    protected readonly stateProxy: S1 & S2
    public get state(): Readonly<S1 & S2> { 
        return { ...this.stateModel.current } 
    }

    public childModel: ChildModel<C1, C2, this>
    protected readonly childProxy: ChildChunk<C1, C2>
    get child(): Readonly<C1 & C2[]>  { 
        return this.childModel.copy() 
    }

    public readonly eventModel: EventModel<E, this> 
    public readonly event: Readonly<EventProducers<E & BaseEvent<this>, this>>;
    readonly eventEmitters: Readonly<EventEmitters<E>>;

    public readonly decorModel: DecorModel<S1, this>
    public readonly decor: Readonly<DecorReceivers<S1, this>>;

    readonly path: string;
    readonly uuid: string;
    readonly code: I;

    readonly root: Model;
    readonly parent: P;
    readonly target: this;

    private copyRefer(origin: ReferGroup<R1, R2>): ReferGroup<R1, R2> {
        const result: ReferGroup<R1, R2> = { ...origin };
        for (const key of Object.keys(origin)) {
            Reflect.set(result, key, [ ...origin[key] ])
        }
        return result;
    }

    get refer(): Readonly<ReferGroup<R1, R2>> { return this.copyRefer(this.referDelegator) }
    private referReleased: Readonly<ReferAddrs<R1, R2>>
    private referSnapshot?: Readonly<ReferGroup<R1, R2>>
    private readonly referWorkspace: ReferAddrs<R1, R2>;
    protected readonly referDelegator: ReferGroup<R1, R2>;

    readonly agent: Agent<E, S1, C1, C2, this>

    

    protected setStateBatch
    
    constructor(props: StrictProps<I, S1, S2, P, C1, C2, R1, R2>) {
        console.log('Constructor', props.code)

        this.parent = props.parent;
        this.target = this;
        this.root = this.parent?.root ?? this;
        this.uuid = props.uuid;
        this.code = props.code;
        this.path = props.path;

        this.decorModel = new DecorModel(this)
        this.decor = this.decorModel.receivers;

        this.eventModel = new EventModel(this)
        this.event = this.eventModel.producers;
        this.eventEmitters = this.eventModel.emitters;

        this.stateModel = new StateModel(this, props.state);
        this.stateProxy = this.stateModel.proxy;
        this.setStateBatch = this.stateModel.setBatch;

        this.childModel = new ChildModel(this, props.child);
        this.childProxy = this.childModel.proxy;

        this.referReleased = props.refer;
        this.referWorkspace = props.refer;
        this.referDelegator = new Proxy({} as ReferGroup<R1, R2>, {
            // get: this.getRefer.bind(this),
            // set: this.setRefer.bind(this),
            // deleteProperty: this.deleteRefer.bind(this),
        })

        this.agent = new Agent(this, '');
    }
    

    private static root: Model | undefined;
    @DebugContext.log()
    static createRoot<M extends Model>(props: Model.Chunk<M>): M | undefined {
        if (Model.root) return Model.root as M;
        const type = ProductContext.query(props.code);
        const uuid = ProductContext.checkUUID()
        if (!type) return undefined;
        props = { ...props, path: 'root', uuid }
        const model: M = new type(props)
        Model.root = model;
        model.load()
        return model;
    }

    get props(): Readonly<Props<I, S1, S2, P, C1, C2, R1, R2>> {
        const result: StrictProps<I, S1, S2, P, C1, C2, R1, R2> = {
            code: this.code,
            uuid: this.uuid,
            path: this.path,
            state: { ...this.stateProxy },
            child: { ...this.childProxy },
            refer: { ...this.referWorkspace },
            parent: this.parent,
        }
        return result;
    }

    get chunk(): Readonly<Chunk<I, S1, S2, C1, C2, R1, R2>> {
        const result: StrictChunk<I, S1, S2, C1, C2, R1, R2> = {
            uuid: this.uuid,
            code: this.code,
            state: { ...this.stateProxy },
            child: { ...this.childProxy },
            refer: { ...this.referWorkspace }
        }
        return result;
    }

    @TrxContext.use()
    private setRefer(origin: Record<string, any>, key: string, value: any) {
        origin[key] = value; 
        return true;
    }

    @TrxContext.use()
    private deleteRefer(origin: Record<string, any>, key: string) {
        delete origin[key]; 
        return true;
    }

    private getRefer<K extends keyof R1>(origin: R1, key: K & string) {
        // if (!origin[key]) {
        //     const model = this.queryChild(this.referWorkspace[key]);
        //     if (!model) return undefined;
        //     Reflect.set(origin, key, model);
        //     model?.referConsumers.push(this);
        // }
        // return origin[key];
    }

    @DebugContext.log()
    public commitRefer() {}

    @DebugContext.log()
    public reset() {
        this.stateModel.reset();
        this.childModel.reset();
        if (this.referSnapshot) {
            this.eventModel.emit('onReferUpdate', {
                prev: this.referSnapshot,
                next: this.refer,
            })
            this.referSnapshot = undefined;
        }
    }
    
    @DebugContext.log()
    debug() {
        console.log(this.child);
    }

    private isInited: boolean = false;

    @TrxContext.use()
    @DebugContext.log()
    public load() {
        this.childModel.load();
        this.eventModel.load();
        this.decorModel.load();
        this.isInited = true;
    }

    @DebugContext.log()
    public unload() {
        this.childModel.unload()
        this.eventModel.unload()
        this.decorModel.unload()
        this.isInited = false;
    }
}

