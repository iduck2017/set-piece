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
import { EventProducer } from "@/submodel/event"

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

    readonly event: Readonly<EventProducers<E & BaseEvent<this>, this>>;
    readonly eventEmitters: Readonly<EventEmitters<E>>;
    private readonly eventConsumers: Map<string, EventConsumer[]>;
    private readonly eventProducers: Map<EventHandler, EventProducer[]>;

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

        this.eventConsumers = new Map();
        this.eventProducers = new Map();
        this.event = new Proxy({} as EventProducers<E & BaseEvent<this>, this>, { 
            get: this.getEvent.bind(this) 
        });
        this.eventEmitters = new Proxy({} as EventEmitters<E>, { 
            get: this.getEventEmitter.bind(this) 
        })
        
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
        const uuid = ProductContext.register()
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

    @TrxContext.in()
    private setRefer(origin: Record<string, any>, key: string, value: any) {
        origin[key] = value; 
        return true;
    }

    @TrxContext.in()
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

    @TrxContext.in()
    @DebugContext.log()
    private pushChild(...args: any[]) {
        const models: any[] = args.map(props => this.createChild(props, 0)).filter(Boolean);
        const result = this.childWorkspace.push(...models);
        return result;
    }

    @TrxContext.in()
    @DebugContext.log()
    private popChild() {
        const model = this.childWorkspace.pop();
        if (model) ProductContext.unregister(model.uuid);
        return model?.chunk;
    }

    @TrxContext.in()
    @DebugContext.log()
    private unshiftChild(...args: any[]) {
        const models: any[] = args.map(props => this.createChild(props, 0)).filter(Boolean)
        const result = this.childWorkspace.unshift(...models);
        return result
    }

    @TrxContext.in()
    @DebugContext.log()
    private fillChild(props: any) {
        this.childWorkspace.forEach((child, index) => {
            const model = this.createChild(props, 0);
            Reflect.set(this.childWorkspace, index, model)
        })
    }

    @TrxContext.in()
    @DebugContext.log()
    private shiftChild(...args: any[]) {
        const model = this.childWorkspace.shift();
        if (model) ProductContext.unregister(model.uuid);
        return model?.chunk;
    }

    @TrxContext.in()
    @DebugContext.log()
    private setChild(origin: any, key: string, props: any) {
        const modelPrev = origin[key]
        if (modelPrev) ProductContext.unregister(modelPrev.uuid);
        const modelNext = this.createChild(props, key);
        Reflect.set(this.childWorkspace, key, modelNext);
        return true;
    }

    @TrxContext.in()
    @DebugContext.log()
    private deleteChild(origin: any, key: string) {
        const modelPrev = this.childWorkspace[key];
        if (modelPrev) ProductContext.unregister(modelPrev.uuid)
        Reflect.deleteProperty(this.childWorkspace, key);
        return true;
    }

    @TrxContext.in()
    private spliceChild() {

    }

    @DebugContext.log({ useResult: false })
    private createChild<M extends Model>(props: Model.Chunk<M>, key: string | number): Model | undefined {
        const constructor = ProductContext.query(props.code);
        if (!constructor) return undefined;
        if (!isNaN(Number(key))) key = '0';
        const uuid = ProductContext.register(props.uuid);
        console.log('createChild', constructor, props.code, uuid);
        return new constructor({
            ...props,
            uuid,
            path: key,
            parent: this,
        })
    }

    @TrxContext.in()
    private deleteState(origin: S1 & S2, key: string) {
        Reflect.deleteProperty(origin, key); 
        this.resetState(key)
        return true;
    }

    @TrxContext.in()
    private setState(origin: S1 & S2, key: any, value: any) {
        Reflect.set(origin, key, value); 
        this.resetState(key);
        return true;
    }

    @TrxContext.in()
    @DebugContext.log()
    public setStateBatch(updater: (prev: S1 & S2) => Partial<S1 & S2>) {
        const statePrev = { ...this.stateWorkspace };
        const stateNext = updater(statePrev);
        Object.keys(stateNext).forEach(key => {
            console.log('SetStateBatch', key)
            Reflect.set(this.stateDelegator, key, stateNext[key]);
        })
    }

    @TrxContext.in()
    public addChild() {

    }

    @TrxContext.in()
    public removeChild() {

    }

    @TrxContext.in()
    public swapChild() {

    }

    @TrxContext.in()
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
            this.emitEvent('onStateUpdate', {
                prev: this.stateSnapshot,
                next: this.state
            })
            this.stateSnapshot = undefined;
            this.stateChecklist = [];
        }
        if (this.childSnapshot) {
            this.emitEvent('onChildUpdate', {
                prev: this.childSnapshot,
                next: this.child
            })
            this.childSnapshot = undefined;
        }
        if (this.referSnapshot) {
            this.emitEvent('onReferUpdate', {
                prev: this.referSnapshot,
                next: this.refer,
            })
            this.referSnapshot = undefined;
        }
    }
    
    private getDecor(origin: any, key: string) { return this.agent.decor[key]; }
    private getEvent(origin: any, key: string) { return this.agent.event[key]; }

    private getEventEmitter(origin: any, key: string) {
        return this.emitEvent.bind(this, key);
    }

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
    private emitEvent<E>(key: string, event: E) {
        let target: Model | undefined = this;
        let path = key;
        while(target) {
            console.log('emitEvent', path);
            const consumers = target.eventConsumers.get(path) ?? [];
            for (const consumer of consumers) {
                const target = consumer.target;
                const handler = consumer.handler;
                handler.call(target, this, event);
            }
            path = target.path + '/' + path;
            target = target.parent;
        }
    }

    @DebugContext.log()
    protected bindEvent<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { target, path } = producer;
        const consumers = target.eventConsumers.get(path) ?? [];
        const producers = this.eventProducers.get(handler) ?? [];
        consumers.push({ target: this, handler });
        producers.push(producer);
        this.eventProducers.set(handler, producers);
        target.eventConsumers.set(path, consumers);
    }

    @DebugContext.log()
    protected unbindEvent<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { target, path } = producer;
        let producers = this.eventProducers.get(handler) ?? [];
        let consumers = target.eventConsumers.get(path) ?? [];
        producers = producers.filter(item => item !== producer);
        consumers = consumers.filter(item => item.handler !== handler || item.target !== this);
        target.eventConsumers.set(path, consumers);
        this.eventProducers.set(handler, producers);
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
        console.log(this.eventConsumers);
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

    @TrxContext.in()
    @DebugContext.log()
    private load() {
        Object.values(this.child).forEach(child => child.load());
        let constructor = this.constructor;
        while (constructor) {
            const hooksEvent = Model.hooksEvent.get(constructor) ?? {};
            for (const key of Object.keys(hooksEvent)) {
                const accessors = hooksEvent[key];
                for (const accessor of accessors) {
                    const producer = accessor(this);
                    if (!producer) continue;
                    const handler: any = Reflect.get(this, key)
                    this.bindEvent(producer, handler);
                }
            }
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
        for (const channel of this.eventProducers) {
            const [ handler, producers ] = channel
            for (const producer of producers) {
                this.unbindEvent(producer, handler);
            }
        }
        for (const channel of this.eventConsumers) {
            const [ path, consumers ] = channel;
            const producer = this.event[path];
            for (const consumer of consumers) {
                const { target, handler } = consumer;
                target.unbindEvent(producer, handler);
            }
        }
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


    private static hooksEvent: Map<Function, Record<string, Array<(model: Model) => EventProducer | undefined>>> = new Map();
    protected static useEvent<E, M extends Model>(accessor: (model: M) => EventProducer<E, M> | undefined) {
        return function(
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<EventHandler<E, M>>
        ): TypedPropertyDescriptor<EventHandler<E, M>> {
            const hooksEvent = Model.hooksEvent.get(target.constructor) ?? {};
            hooksEvent[key] = [...(hooksEvent[key] ?? []), accessor];
            Model.hooksEvent.set(target.constructor, hooksEvent);
            return descriptor;
        };
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

