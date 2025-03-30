import { Agent, ChildAgent } from "./agent"
import { ReferAddrs, ReferGroup } from "../types/refer"
import { Chunk, StrictChunk, ChildChunk } from "../types/chunk"
import { DecorProvider, DecorReceiver, DecorReceivers, DecorUpdater } from "../types/decor"
import { BaseEvent, EventConsumer, EventEmitters, EventHandler, EventProducers } from "../types/event"
import { Props, StrictProps } from "../types/props"
import { Value } from "../types"
import { ProductContext } from "@/context/product"
import { DebugContext } from "@/context/debug"
import { TrxContext } from "@/context/trx"
import { EventProducer, EventModel } from "@/submodel/event"

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
    get state(): Readonly<S1 & S2> { return { ...this.stateDecorated } }
    private stateDecorated: Readonly<S1 & S2>
    private stateSnapshot?: Readonly<S1 & S2>
    private stateReleased: Readonly<S1 & S2>
    private readonly stateWorkspace: S1 & S2
    protected readonly stateDelegator: S1 & S2
    private stateChecklist: string[] = [];

    private copyChild(origin: C1 & C2[]): C1 & C2[] {
        const result: any = [];
        for (const key of Object.keys(origin)) {
            const value = Reflect.get(origin, key);
            Reflect.set(result, key, value);
        }
        return result;
    }

    get child(): Readonly<C1 & C2[]>  { return this.copyChild(this.childReleased) }
    private childReleased: Readonly<C1 & C2[]>;
    private childSnapshot?: Readonly<C1 & C2[]>
    private readonly childWorkspace: C1 & C2[]
    protected readonly childDelegator: ChildChunk<C1, C2>

    public readonly eventModel: EventModel<E, this> 

    readonly event: Readonly<EventProducers<E & BaseEvent<this>, this>>;
    readonly eventEmitters: Readonly<EventEmitters<E>>;

    readonly decor: Readonly<DecorReceivers<S1, this>>;
    private readonly decorProviders: Map<string, DecorProvider[]>;
    private readonly decorReceivers: Map<DecorUpdater, DecorReceiver[]>;

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

    get props(): Readonly<Props<I, S1, S2, P, C1, C2, R1, R2>> {
        const result: StrictProps<I, S1, S2, P, C1, C2, R1, R2> = {
            code: this.code,
            uuid: this.uuid,
            path: this.path,
            state: { ...this.stateDelegator },
            child: { ...this.childDelegator },
            refer: { ...this.referWorkspace },
            parent: this.parent,
        }
        return result;
    }

    get chunk(): Readonly<Chunk<I, S1, S2, C1, C2, R1, R2>> {
        const result: StrictChunk<I, S1, S2, C1, C2, R1, R2> = {
            uuid: this.uuid,
            code: this.code,
            state: { ...this.stateDelegator },
            child: { ...this.childDelegator },
            refer: { ...this.referWorkspace }
        }
        return result;
    }
    
    constructor(props: StrictProps<I, S1, S2, P, C1, C2, R1, R2>) {
        console.log('Constructor', props.code)

        this.parent = props.parent;
        this.target = this;
        this.root = this.parent?.root ?? this;
        this.uuid = props.uuid;
        this.code = props.code;
        this.path = props.path;

        this.decorProviders = new Map();
        this.decorReceivers = new Map();
        this.decor = new Proxy({} as DecorReceivers<S1, this>, { 
            get: this.getDecor.bind(this) 
        });

        this.eventModel = new EventModel(this)
        this.event = this.eventModel.producers;
        this.eventEmitters = this.eventModel.emitters;

        this.stateReleased = { ...props.state }
        this.stateDecorated = { ...props.state }
        this.stateWorkspace = { ...props.state }
        this.stateDelegator = new Proxy(this.stateWorkspace, {
            get: this.getState.bind(this),
            set: this.setState.bind(this),
            deleteProperty: this.deleteState.bind(this),
        })

        const childOrigin: any = [];
        Object.keys(props.child).forEach(key => {
            const chunk = props.child[key];
            const model = this.createChild(chunk, key);
            childOrigin[key] = model;
        })
        this.childReleased = childOrigin;
        this.childWorkspace = childOrigin;
        this.childDelegator = new Proxy(childOrigin, {
            get: this.getChild.bind(this),
            set: this.setChild.bind(this),
            deleteProperty: this.deleteChild.bind(this),
        })

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
        const uuid = ProductContext.registerId()
        if (!type) return undefined;
        props = { ...props, path: 'root', uuid }
        const model: M = new type(props)
        Model.root = model;
        model.load()
        return model;
    }

    private getState(origin: any, key: string) {
        return this.stateReleased[key];
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

    private getChild(origin: any, key: string) {
        const value = this.childReleased[key];
        if (value instanceof Model) return value.chunk;
        if (typeof value === 'function' && typeof key === 'string') {
            if (key === 'push') return this.pushChild.bind(this);
            if (key === 'pop') return this.popChild.bind(this);
            if (key === 'shift') return this.shiftChild.bind(this);
            if (key === 'unshift') return this.unshiftChild.bind(this);
            if (key === 'splice') return;
            if (key === 'reverse') return;
            if (key === 'sort') return;
            if (key === 'fill') return this.fillChild.bind(this);
        }
        return this.childReleased[key];
    }

    @TrxContext.use()
    @DebugContext.log()
    private pushChild(...args: any[]) {
        const models: any[] = args.map(props => this.createChild(props, 0)).filter(Boolean);
        const result = this.childWorkspace.push(...models);
        return result;
    }

    @TrxContext.use()
    @DebugContext.log()
    private popChild() {
        const model = this.childWorkspace.pop();
        if (model) ProductContext.unregisterId(model.uuid);
        return model?.chunk;
    }

    @TrxContext.use()
    @DebugContext.log()
    private unshiftChild(...args: any[]) {
        const models: any[] = args.map(props => this.createChild(props, 0)).filter(Boolean)
        const result = this.childWorkspace.unshift(...models);
        return result
    }

    @TrxContext.use()
    @DebugContext.log()
    private fillChild(props: any) {
        this.childWorkspace.forEach((child, index) => {
            const model = this.createChild(props, 0);
            Reflect.set(this.childWorkspace, index, model)
        })
    }

    @TrxContext.use()
    @DebugContext.log()
    private shiftChild(...args: any[]) {
        const model = this.childWorkspace.shift();
        if (model) ProductContext.unregisterId(model.uuid);
        return model?.chunk;
    }

    @TrxContext.use()
    @DebugContext.log()
    private setChild(origin: any, key: string, props: any) {
        const modelPrev = origin[key]
        if (modelPrev) ProductContext.unregisterId(modelPrev.uuid);
        const modelNext = this.createChild(props, key);
        Reflect.set(this.childWorkspace, key, modelNext);
        return true;
    }

    @TrxContext.use()
    @DebugContext.log()
    private deleteChild(origin: any, key: string) {
        const modelPrev = this.childWorkspace[key];
        if (modelPrev) ProductContext.unregisterId(modelPrev.uuid)
        Reflect.deleteProperty(this.childWorkspace, key);
        return true;
    }

    @TrxContext.use()
    private spliceChild() {

    }

    @DebugContext.log({ useResult: false })
    private createChild<M extends Model>(props: Model.Chunk<M>, key: string | number): Model | undefined {
        const constructor = ProductContext.query(props.code);
        if (!constructor) return undefined;
        if (!isNaN(Number(key))) key = '0';
        const uuid = ProductContext.registerId(props.uuid);
        console.log('createChild', constructor, props.code, uuid);
        return new constructor({
            ...props,
            uuid,
            path: key,
            parent: this,
        })
    }

    @TrxContext.use()
    private deleteState(origin: S1 & S2, key: string) {
        Reflect.deleteProperty(origin, key); 
        this.resetState(key)
        return true;
    }

    @TrxContext.use()
    private setState(origin: S1 & S2, key: any, value: any) {
        Reflect.set(origin, key, value); 
        this.resetState(key);
        return true;
    }

    @TrxContext.use()
    @DebugContext.log()
    public setStateBatch(updater: (prev: S1 & S2) => Partial<S1 & S2>) {
        const statePrev = { ...this.stateWorkspace };
        const stateNext = updater(statePrev);
        Object.keys(stateNext).forEach(key => {
            console.log('SetStateBatch', key)
            Reflect.set(this.stateDelegator, key, stateNext[key]);
        })
    }

    @TrxContext.use()
    public addChild() {

    }

    @TrxContext.use()
    public removeChild() {

    }

    @TrxContext.use()
    public swapChild() {

    }

    @TrxContext.use()
    resetState(path: string) {
        const pathSegments = path.split('/');
        const key = pathSegments.shift();
        if (!key) return;
        if (pathSegments.length > 1) {
            const pathNext = pathSegments.join('/')
            if (key === '0') this.child.forEach(child => child.resetState(pathNext))
            else Reflect.get(this.child, key).resetState(pathNext)
        } else {
            if (this.stateChecklist.includes(key)) return;
            this.stateChecklist.push(key);
        }
    }

    @DebugContext.log()
    public commitState() {
        if (!this.stateChecklist.length) return;
        console.log('updateState', ...this.stateChecklist);
        const stateDecorated = { ...this.stateDecorated };
        for (const key of this.stateChecklist) {
            const valueComputed = this.emitDecor(key);
            Reflect.set(stateDecorated, key, valueComputed);
        }
        this.stateSnapshot = this.state
        this.stateReleased = { ...this.stateWorkspace };
        this.stateDecorated = stateDecorated;
    }

    @DebugContext.log()
    public commitChild() {
        const childPrev: Model[] = Object.values(this.childReleased);
        const childNext: Model[] = Object.values(this.childWorkspace);
        const childCreated = childNext.filter(item => !childPrev.includes(item))
        const childRemoved = childPrev.filter(item => !childNext.includes(item))
        if (!childCreated.length && !childRemoved.length) return;
        for (const child of childRemoved) child.unload();
        this.childSnapshot = this.child;
        this.childReleased = this.copyChild(this.childWorkspace);
        for (const child of childCreated) child.load();
    }

    @DebugContext.log()
    public commitRefer() {}

    @DebugContext.log()
    public clear() {
        if (this.stateSnapshot) {
            this.eventModel.emit('onStateUpdate', {
                prev: this.stateSnapshot,
                next: this.state
            })
            this.stateSnapshot = undefined;
            this.stateChecklist = [];
        }
        if (this.childSnapshot) {
            this.eventModel.emit('onChildUpdate', {
                prev: this.childSnapshot,
                next: this.child
            })
            this.childSnapshot = undefined;
        }
        if (this.referSnapshot) {
            this.eventModel.emit('onReferUpdate', {
                prev: this.referSnapshot,
                next: this.refer,
            })
            this.referSnapshot = undefined;
        }
    }
    
    private getDecor(origin: any, key: string) { return this.agent.decor[key]; }

    @DebugContext.log()
    private emitDecor(key: string) {
        let target: Model | undefined = this;
        let result = this.stateWorkspace[key];
        let path = key;
        console.log('stateOrigin', key, result)
        while (target) {
            console.log('emitDecor', path);
            const providers = target.decorProviders.get(path) ?? [];
            for (const provider of providers) {
                const target = provider.target;
                const updater = provider.updater;
                result = updater.call(target, this, result);
            }
            path = target.path + '/' + path;
            target = target.parent;
        }
        console.log('stateComputed', key, result);
        return result;
    }

    

    @DebugContext.log()
    protected bindDecor<S, M extends Model>(
        receiver: DecorReceiver<S, M>,
        updater: DecorUpdater<S, M>
    ) {
        const { target, path } = receiver;
        console.log('bindDecor', path)
        const providers = target.decorProviders.get(path) ?? [];
        const receivers = this.decorReceivers.get(updater) ?? [];
        providers.push({ target: this, updater });
        receivers.push(receiver);
        this.decorReceivers.set(updater, receivers); 
        target.decorProviders.set(path, providers);
        target.resetState(path);
    }

    @DebugContext.log()
    debug() {
        console.log(this.child);
        console.log(this.decorProviders);
    }

    @DebugContext.log({ useArgs: true })
    protected unbindDecor<S, M extends Model>(
        receiver: DecorReceiver<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { target, path } = receiver;
        let receivers = this.decorReceivers.get(updater) ?? [];
        let providers = target.decorProviders.get(path) ?? [];
        receivers = receivers.filter(item => item !== receiver);
        providers = providers.filter(item => item.updater !== updater || item.target !== this);
        this.decorReceivers.set(updater, receivers);
        target.decorProviders.set(path, providers);
        target.resetState(path);
    }

    private isInited: boolean = false;

    @TrxContext.use()
    @DebugContext.log()
    private load() {
        Object.values(this.child).forEach(child => child.load());
        let constructor = this.constructor;
        while (constructor) {
            this.eventModel.load();
            const hooksDecor = Model.hooksDecor.get(constructor) ?? {};
            for (const key of Object.keys(hooksDecor)) {
                const accessors = hooksDecor[key];
                for (const accessor of accessors) {
                    const receiver = accessor(this);
                    if (!receiver) continue;
                    const updater: any = Reflect.get(this, key)
                    this.bindDecor(receiver, updater);
                }
            }
            constructor = Reflect.get(constructor, '__proto__');
        }
        this.isInited = true;
    }

    @DebugContext.log()
    private unload() {
        Object.values(this.child).forEach(child => child.unload());
        this.eventModel.unload()
        for (const channel of this.decorReceivers) {
            const [ updater, receivers ] = channel;
            for (const receiver of receivers) {
                this.unbindDecor(receiver, updater);
            }
        }
        for (const channel of this.decorProviders) {
            const [ path, providers ] = channel;
            const receiver = this.decor[path];
            for (const provider of providers) {
                const { target, updater } = provider;
                target.unbindDecor(receiver, updater);
            }
        }
        this.isInited = false;
    }

    private static hooksDecor: Map<Function, Record<string, Array<(model: Model) => DecorReceiver | undefined>>> = new Map()
    protected static useDecor<S, M extends Model, T extends Model>(accessor: (model: T) => DecorReceiver<S, M> | undefined) {
        return function(
            target: T,
            key: string,
            descriptor: TypedPropertyDescriptor<DecorUpdater<S, M>>
        ): TypedPropertyDescriptor<DecorUpdater<S, M>> {
            const hooksDecor = Model.hooksDecor.get(target.constructor) ?? {};
            hooksDecor[key] = [...(hooksDecor[key] ?? []), accessor];
            Model.hooksDecor.set(target.constructor, hooksDecor);
            return descriptor;
        };
    }
}

