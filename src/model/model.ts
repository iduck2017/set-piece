import { Agent } from "./agent"
import { ReferAddrs, ReferGroup } from "./refer"
import { Chunk, StrictChunk, ChildChunk } from "./chunk"
import { DecorProvider, DecorReceiver, DecorReceivers, DecorUpdater } from "./decor"
import { BaseEvent, EventConsumer, EventEmitters, EventHandler, EventProducer, EventProducers } from "./event"
import { Props, StrictProps } from "./props"
import { Value } from "./types"

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
    get state(): Readonly<S1 & S2> { return { ...this.stateDelegator } }
    private stateReleased: Readonly<S1 & S2>
    private stateSnapshot?: Readonly<S1 & S2>
    private stateChecklist: string[] = [];
    private readonly stateWorkspace: S1 & S2
    protected readonly stateDelegator: S1 & S2

    private copyChild(origin: C1 & C2[]): C1 & C2[] {
        const result: any = [ ...origin ];
        Object.keys(origin)
            .filter(key => isNaN(Number(key)))
            .forEach(key => {
                const value = Reflect.get(origin, key);
                Reflect.set(result, key, value); 
            });
        return result;
    }

    get child(): Readonly<C1 & C2[]>  { return this.copyChild(this.childReleased) }
    private childReleased: Readonly<C1 & C2[]>;
    private childSnapshot?: Readonly<C1 & C2[]>
    private readonly childWorkspace!: C1 & C2[];
    protected readonly childDelegator: ChildChunk<C1, C2>

    readonly event: Readonly<EventProducers<E & BaseEvent<this>, this>>;
    readonly eventEmitters: Readonly<EventEmitters<E>>;
    private readonly eventConsumers: Map<string, EventConsumer[]>;
    private readonly eventProducers: Map<EventHandler, EventProducer[]>;

    readonly decor: Readonly<DecorReceivers<S1, this>>;
    private readonly decorProviders: Map<string, DecorProvider[]>;
    private readonly decorReceivers: Map<DecorUpdater, DecorReceiver[]>;

    readonly uuid: string;
    readonly code: I;

    readonly parent: P;
    readonly root: Model;
    readonly pathAbsolute: string | undefined;
    readonly pathRelative: string | undefined;
    readonly pathAbstract: string | undefined;

    private copyRefer(origin: Readonly<ReferGroup<R1, R2>>): ReferGroup<R1, R2> {
        const result: any = {};
        Object.keys(origin).forEach(key => {
            if (origin[key] instanceof Array) result[key] = [...origin[key]];
            else result[key] = origin[key]
        })
        return result;
    }

    get refer(): Readonly<ReferGroup<R1, R2>> { return this.copyRefer(this.referReleased) }
    private referReleased: Readonly<ReferGroup<R1, R2>>
    private referSnapshot?: Readonly<ReferGroup<R1, R2>>
    private readonly referWorkspace: ReferGroup<R1, R2>;
    protected readonly referDelegator: ReferAddrs<R1, R2>;
    private readonly referConsumers: Model[] = [];

    readonly agent: Agent<E, S1, C1, C2, this>

    get props(): Readonly<Props<I, S1, S2, P, C1, C2, R1, R2>> {
        const result: StrictProps<I, S1, S2, P, C1, C2, R1, R2> = {
            code: this.code,
            uuid: this.uuid,
            path: this.pathRelative,
            state: { ...this.stateDelegator },
            child: { ...this.childDelegator },
            refer: { ...this.referDelegator },
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
            refer: { ...this.referDelegator }
        }
        return result;
    }
    
    constructor(props: StrictProps<I, S1, S2, P, C1, C2, R1, R2>) {
        this.parent = props.parent;
        this.root = this.parent?.root ?? this;
        this.uuid = props.uuid;
        this.code = props.code;
        this.pathRelative = props.path;
        this.pathAbsolute = props.parent?.pathAbsolute ? 
            `${props.parent.pathAbsolute}/${this.pathRelative}` : undefined;
    
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
        this.stateWorkspace = { ...props.state }
        this.stateDelegator = new Proxy(this.stateWorkspace, {
            set: this.setState.bind(this),
            deleteProperty: this.deleteState.bind(this),
        })

        const childOrigin: any = [];
        Object.keys(props.child).forEach(key => {
            const model = this.createChild(props.child[key], key);
            if (!model) return;
            childOrigin[key] = model;
            if (!isNaN(Number(key))) childOrigin.length += 1;
        })
        this.childReleased = this.copyChild(childOrigin);
        this.childWorkspace = childOrigin
        this.childDelegator = new Proxy(childOrigin, {
            get: this.getChild.bind(this),
            set: this.setChild.bind(this),
            deleteProperty: this.deleteChild.bind(this),
        })

        const referOrigin: any = {};
        Object.keys(props.refer).forEach(key => {
            if (props.refer[key] instanceof Array) referOrigin[key] = []
        })
        this.referConsumers = [];
        this.referReleased = this.copyRefer(referOrigin);
        this.referWorkspace = this.copyRefer(referOrigin);
        this.referDelegator = new Proxy(props.refer, {
            // get: this.getRefer.bind(this),
            // set: this.setRefer.bind(this),
            // deleteProperty: this.deleteRefer.bind(this),
        })
        this.agent = new Agent(this, undefined);
    }

    queryChild(path?: string): Model | undefined { 
        if (!path) return undefined;
        const keys = path.split('/');
        let target = this.root;
        while (keys.length) {
            const key = keys.shift();
            if (!key) return undefined;
            target = this.child[key];
        }
        return target;
    }

    @Model.useFiber()
    private setRefer(origin: Record<string, any>, key: string, value: any) {
        origin[key] = value; 
        return true;
    }

    @Model.useFiber()
    private deleteRefer(origin: Record<string, any>, key: string) {
        delete origin[key]; return true;
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

    private getChild(origin: Record<string, any>, key: string) {
        const value = origin[key];
        if (value instanceof Model) return value.chunk;
        if (typeof value === 'function' && typeof key === 'string') {
            return this.operateChild.bind(value);
        } 
        return origin[key].chunk;
    }

    @Model.useFiber()
    private operateChild(handler: (...args: any[]) => any, ...args: any[]) {
        return handler.call(this.childWorkspace, ...args);
    }

    @Model.useFiber()
    private setChild(origin: any, key: string, props: any) {
        const model = this.createChild(props, key);
        if (!model) return true;
        Reflect.set(this.childWorkspace, key, model);
        return true;
    }

    @Model.useFiber()
    private deleteChild(origin: any, key: string) {
        Reflect.deleteProperty(this.childWorkspace, key);
        return true;
    }

    private createChild<M extends Model>(chunk: Model.Chunk<M>, path: string): Model | undefined {
        const uuid = chunk.uuid ?? '';
        const props: Model.Props<M> = { ...chunk, parent: this, path: path, uuid };
        // return new chunk.type(props)
        return undefined;
    }

    @Model.useFiber()
    private deleteState(origin: S1 & S2, key: string) {
        this.stateChecklist.push(key);
        Reflect.deleteProperty(origin, key); 
        return true;
    }

    @Model.useFiber()
    private setState(origin: S1 & S2, key: any, value: any) {
        this.stateChecklist.push(key);
        Reflect.set(origin, key, value); 
        return true;
    }

    @Model.useFiber()
    private resetState(key: string) {
        this.stateChecklist.push(key);
    }

    private refreshState() {
        const stateCurrent = { ...this.stateReleased };
        for (const key of this.stateChecklist) {
            const value = this.emitDecor(key);
            Reflect.set(stateCurrent, key, value);
        }
        this.stateSnapshot = this.state
        this.stateReleased = stateCurrent;
    } 

    private refreshChild() {
        const childCurrent: Model[] = Object.values(this.childReleased);
        const childWorkspace: Model[] = Object.values(this.childWorkspace);
        const childCreated = childWorkspace.filter(child => !childCurrent.includes(child))
        const childRemoved = childCurrent.filter(child => !childWorkspace.includes(child));
        this.childSnapshot = this.child;
        this.childReleased = this.copyChild(this.childWorkspace);
        childRemoved.forEach(child => child.uninit());
        childCreated.forEach(child => child.init());
    }

    private refreshRefer() {
    }

    private resetSnapshot() {
        if (this.stateSnapshot) this.emitEvent('onStateUpdate', {
            prev: this.stateSnapshot,
            next: this.state
        })
        if (this.childSnapshot) this.emitEvent('onChildUpdate', {
            prev: this.childSnapshot,
            next: this.child
        })
        if (this.referSnapshot) this.emitEvent('onReferUpdate', {
            prev: this.referSnapshot,
            next: this.refer,
        })
        this.stateChecklist = [];
        this.stateSnapshot = undefined;
        this.childSnapshot = undefined;
        this.referSnapshot = undefined;
    }

    private getEvent<
        K extends keyof T & string,
        T extends Record<string, EventProducer>
    >(origin: T, key: K) {
        if (!origin[key]) Reflect.set(origin, key, new EventProducer(this, key));
        return origin[key];
    }

    private getDecor<
        K extends keyof T & string, 
        T extends Record<string, DecorReceiver>
    >(origin: T, key: K) {
        if (!origin[key]) Reflect.set(origin, key, new DecorReceiver(this, key));
        return origin[key];
    }

    private getEventEmitter(origin: EventEmitters<E>, key: keyof EventEmitters<E> & string) {
        return this.emitEvent.bind(this, key);
    }

    private emitDecor(key: string) {
        const path = this.pathAbstract? `${this.pathAbstract}/${key}` : key;
        let state = this.stateWorkspace[key];
        let parent: Model | undefined = this;
        while(parent) {
            const providers = parent.decorProviders.get(path) ?? [];
            for (const provider of providers) {
                const { target, updater } = provider;
                state = updater.call(target, this, state);
            }
            parent = parent.parent;
        }
        return state;
    }

    private emitEvent<E>(key: string, event: E) {
        const consumers = this.eventConsumers.get(key) ?? [];
        for (const consumer of consumers) {
            const { target, handler } = consumer;
            handler.call(target, this, event);
        }
        let parent: Model | undefined = this.parent;
        let path: string = key;
        while (parent) {
            const key = isNaN(Number(parent.pathRelative)) ? parent.pathRelative : '0';
            path = `${key}/${path}`
            const consumers = parent.eventConsumers.get(path) ?? [];
            for (const consumer of consumers) {
                const { target, handler } = consumer;
                handler.call(target, this, event);
            }
            parent = parent.parent;
        }
    }

    protected bindEvent<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { self: target } = producer;
        const consumers = target.eventConsumers.get(producer.pathRelative) ?? [];
        consumers.push({ target: this, handler });
        target.eventConsumers.set(producer.pathRelative, consumers);
        const producers: EventProducer[] = this.eventProducers.get(handler) ?? [];
        producers.push(producer);
        this.eventProducers.set(handler, producers);
    }

    protected unbindEvent<E, M extends Model>(
        producer: EventProducer<E, M> | undefined, 
        handler: EventHandler<E, M>
    ) {
        const producers = this.eventProducers.get(handler) ?? [];
        for (const producerTemp of producers) {
            if (producer !== producerTemp) continue;
            const { self: target } = producerTemp;
            const consumers = target.eventConsumers.get(producerTemp.pathRelative)?.filter(item => item.handler !== handler) ?? [];
            target.eventConsumers.set(producerTemp.pathRelative, consumers);
        }
        const producersNext = producer ? producers.filter(producerCur => producerCur !== producer) : [];
        this.eventProducers.set(handler, producersNext);
    }

    protected bindDecor<S, M extends Model>(
        receiver: DecorReceiver<S, M>,
        updater: DecorUpdater<S, M>
    ) {
        const { self: target } = receiver;
        const providers = target.decorProviders.get(receiver.pathRelative) ?? [];
        providers.push({ target: this, updater });
        target.decorProviders.set(receiver.pathRelative, providers);
        const receivers: DecorReceiver[] = this.decorReceivers.get(updater) ?? [];
        receivers.push(receiver);
        this.eventProducers.set(updater, receivers); 
        // emit recheck
    }

    protected unbindDecor<S, M extends Model>(
        receiver: DecorReceiver<S, M> | undefined, 
        updater: DecorUpdater<S, M>
    ) {
        const receivers = this.decorReceivers.get(updater) ?? [];
        for (const receiverTemp of receivers) {
            if (receiver !== receiverTemp) continue;
            const { self: target } = receiverTemp;
            const providers = target.decorProviders.get(receiverTemp.pathRelative)?.filter(item => item.updater !== updater) ?? [];
            target.decorProviders.set(receiverTemp.pathRelative, providers);
        }
        const receiversNext = receiver ? receivers.filter(receiverCur => receiverCur !== receiver) : [];
        this.eventProducers.set(updater, receiversNext);
        // emit recheck 
    }

    private init() {
        Object.values(this.child).forEach(child => child.init());
        
        let constructor = this.constructor;
        while (constructor) {
            const hooksEvent = Model.hooksEvent.get(constructor) ?? {};
            Object.keys(hooksEvent).forEach(key => {
                const accessors = hooksEvent[key];
                for (const accessor of accessors) {
                    const producer = accessor(this);
                    if (!producer) continue;
                    const handler: any = Reflect.get(this, key)
                    this.bindEvent(producer, handler);
                }
            })
            const hooksDecor = Model.hooksDecor.get(constructor) ?? {};
            Object.keys(hooksDecor).forEach(key => {
                const accessors = hooksDecor[key];
                for (const accessor of accessors) {
                    const receiver = accessor(this);
                    if (!receiver) continue;
                    const updater: any = Reflect.get(this, key)
                    this.bindDecor(receiver, updater);
                }
            })
            constructor = Reflect.get(constructor, '__proto__');
        }
    }
    
    private uninit() {
        Object.values(this.child).forEach(child => child.uninit());

        for (const channel of this.eventConsumers) {
            const [ producerKey, consumers ] = channel;
            const producer = this.event[producerKey];
            for (const consumer of consumers) {
                const { target, handler } = consumer;
                target.unbindEvent(producer, handler);
            }
        }
        for (const channel of this.eventProducers) {
            const [ handler ] = channel
            this.unbindEvent(undefined, handler)
        }

        for (const channel of this.decorProviders) {
            const [ receiverKey, providers ] = channel;
            const receiver = this.decor[receiverKey];
            for (const provider of providers) {
                const { target, updater } = provider;
                target.unbindDecor(receiver, updater);
            }
        }
        for (const channel of this.decorReceivers) {
            const [ updater ] = channel;
            this.unbindDecor(undefined, updater);
        }
    }


    private static hooksEvent: Map<Function, Record<string, Array<(model: Model) => EventProducer | undefined>>>;
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

    
    private static hooksDecor: Map<Function, Record<string, Array<(model: Model) => DecorReceiver | undefined>>>
    protected static useDecor<S, M extends Model>(accessor: (model: M) => DecorReceiver<S, M> | undefined) {
        return function(
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<DecorUpdater<S, M>>
        ): TypedPropertyDescriptor<DecorUpdater<S, M>> {
            const hooksDecor = Model.hooksDecor.get(target.constructor) ?? {};
            hooksDecor[key] = [...(hooksDecor[key] ?? []), accessor];
            Model.hooksDecor.set(target.constructor, hooksDecor);
            return descriptor;
        };
    }

    private static modelChecklist: Model[] = [];
    private static isFiberic: boolean = false;
    protected static useFiber() {
        return function(
            target: Model,
            key: string,
            descriptor: TypedPropertyDescriptor<(...args: any) => any>
        ): TypedPropertyDescriptor<(...args: any) => any> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Model, ...args: any[]) {
                    if (Model.modelChecklist.includes(this)) return handler.apply(this, args);
                    Model.modelChecklist.push(this);
                    if (Model.isFiberic) return handler.apply(this, args);
                    Model.isFiberic = true;
                    console.log('Fiberic+ ============')
                    const result = handler.apply(this, args);
                    Model.modelChecklist.forEach(model => model.refreshChild());
                    Model.modelChecklist.forEach(model => model.refreshRefer());
                    Model.modelChecklist.forEach(model => model.refreshState());
                    Model.modelChecklist.forEach(model => model.resetSnapshot());
                    Model.isFiberic = false;
                    Model.modelChecklist = [];
                    console.log('Fiberic- ============')
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }
    
}
