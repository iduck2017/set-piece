import { Agent } from "./agent"
import { Cache } from "./cache"
import { ChildChunk, Chunk, ReferAddrs, StrictChunk } from "./chunk"
import { DecorProvider, DecorReceiver, DecorReceivers, DecorUpdater } from "./decor"
import { BaseEvent, EventConsumer, EventEmitters, EventHandler, EventProducer, EventProducers } from "./event"
import { Props, StrictProps } from "./props"
import { Value } from "./types"

type BaseModel = Model<{}, {}, {}, {}, BaseModel | undefined, BaseModel, {}, BaseModel>

export namespace Model {
    export type Props<M extends Model> = M['props']
    export type Chunk<M extends Model> = M['chunk']
    export type Agent<M extends Model> = M['agent']
    export type State<M extends Model> = M['state']
    export type Child<M extends Model> = M['child']
    export type Refer<M extends Model> = M['refer']
    // export type ChildGroup<M extends Model> = M['childGroup']
    // export type ReferGroup<M extends Model> = M['referGroup']
}

export abstract class Model<
    E extends Record<string, any> = {},
    S extends Record<string, Value> = {},
    D extends Record<string, Value> = {},
    C extends Record<string, Model> = {},
    P extends Model | undefined = BaseModel | undefined,
    I extends Model = BaseModel,
    R extends Record<string, Model> = {},
    Q extends Model = BaseModel
> {
    get state(): Readonly<S & D> { return { ...this.stateAgent } }
    private readonly stateOrigin: S & D
    protected readonly stateAgent: S & D

    copyChild(origin: any) {
        const result: any = [];
        Object.keys(origin).forEach((key) => {
            const value = Reflect.get(origin, key);
            Reflect.set(result, key, value);
        });
        result.length = origin.length;
        return result;
    }

    get child(): Readonly<C> & I[] { return this.copyChild(this.childOrigin) }
    private readonly childOrigin: Readonly<C> & I[];
    protected readonly childAgent: ChildChunk<C> & Model.Chunk<I>[];
    
    // get childGroup(): Readonly<I[]> { return [...this.childGroupOrigin] }
    // private readonly childGroupOrigin: Readonly<I[]>;
    // protected readonly childGroupAgent: Model.Chunk<I>[];

    readonly parent: P;
    readonly root: Model;

    readonly event: Readonly<EventProducers<E & BaseEvent<this>, this>>;
    readonly eventEmitter: Readonly<EventEmitters<E>>;
    private readonly eventConsumers: Map<string, EventConsumer[]>
    private readonly eventProducers: Map<EventHandler, EventProducer[]>

    readonly decor: Readonly<DecorReceivers<S, this>>;
    private readonly decorProviders: Map<string, DecorProvider[]>
    private readonly decorReceivers: Map<DecorUpdater, DecorReceiver[]>

    readonly uuid: string;
    readonly key?: string;
    readonly path?: string;

    get refer(): Readonly<Partial<R>> { return { ...this.referAgent } }
    private readonly referOrigin: ReferAddrs<R>;
    protected readonly referAgent: Partial<R>;

    get referGroup(): Readonly<Q[]> { return [ ...this.referGroupAgent ] }
    private readonly referGroupOrigin: string[];
    protected readonly referGroupAgent: Q[];

    private readonly referConsumers: Model[];

    readonly agent: Agent<E, S, C, I, this>
    private cache: Cache<S, D, C, I, R, Q> | undefined


    get props(): Readonly<Props<S, D, C, P, I, R>> {
        const result: StrictProps<S, D, C, P, I, R> = {
            uuid: this.uuid,
            state: { ...this.stateAgent },
            child: { ...this.childAgent },
            refer: { ...this.referOrigin },
            parent: this.parent,
            key: this.key,
            childGroup: [ ...this.childGroupAgent ],
            referGroup: [ ...this.referGroupOrigin ],
        }
        return result;
    }


    get chunk(): Readonly<Chunk<S, D, C, P, I, R, this>> {
        const result: StrictChunk<S, D, C, P, I, R, this> = {
            uuid: this.uuid,
            type: this.constructor as new (props: any) => this,
            state: { ...this.stateAgent },
            child: { ...this.childAgent },
            refer: { ...this.referOrigin },
            childGroup: [ ...this.childGroupAgent ],
            referGroup: [ ...this.referGroupOrigin ],
        }
        return result;
    }
    
    constructor(props: StrictProps<S, D, C, P, I, R>) {
        this.referConsumers = [];
        this.eventConsumers = new Map()
        this.eventProducers = new Map()
        this.decorProviders = new Map()
        this.decorReceivers = new Map()
        this.parent = props.parent;
        this.root = this.parent?.root ?? this;
        this.uuid = props.uuid;
        this.key = props.key;
        if (this.parent && this.key) this.path = `${this.parent.path}/${this.key}`;
        this.event = new Proxy(
            {} as EventProducers<E & BaseEvent<this>, this>, 
            { get: this.getEvent.bind(this) }
        );
        this.decor = new Proxy(
            {} as DecorReceivers<S, this>, 
            { get: this.getDecor.bind(this) }
        );
        this.eventEmitter = new Proxy(
            {} as EventEmitters<E>, 
            { get: this.getEventEmitter.bind(this) }
        )
        this.stateOrigin = { ...props.state }
        this.stateAgent = new Proxy({ ...props.state }, {
            set: this.setState.bind(this),
            deleteProperty: this.deleteState.bind(this),
        })
        const childOrigin = {} as any;
        Object.keys(props.child).forEach(key => {
            childOrigin[key] = this.createChild(props.child[key], key)
        })
        this.childOrigin = childOrigin;
        this.childAgent = new Proxy(childOrigin, {
            get: this.getChild.bind(this),
            set: this.setChild.bind(this),
            deleteProperty: this.deleteChild.bind(this),
        })
        const childGroupOrigin: any = props.childGroup.map((child, index) => {
            return this.createChild(child, String(index));
        });
        this.childGroupOrigin = childGroupOrigin;
        this.childGroupAgent = new Proxy(childGroupOrigin, {
            get: this.getChild.bind(this),
            set: this.setChild.bind(this),
            deleteProperty: this.deleteChild.bind(this),
        })
        this.referOrigin = { ...props.refer };
        this.referAgent = new Proxy({} as any, {
            get: this.getRefer.bind(this),
            set: this.setRefer.bind(this),
            deleteProperty: this.deleteRefer.bind(this),
        })
        this.referGroupOrigin = [ ...props.referGroup ]; 
        this.referGroupAgent = new Proxy([] as any, {
            // get: this.getRefer.bind(this),
            // set: this.getRefer.bind(this),
            // deleteProperty: this.getRefer.bind(this),
        })
        this.agent = new Agent();
    }

    queryChild(path?: string): Model | undefined { 
        if (!path) return undefined;
        const keys = path.split('/');
        let target = this.root;
        while (keys.length) {
            const key = keys.shift();
            if (!key) return undefined;
            if (!isNaN(Number(key))) target = this.childGroup[Number(key)];
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

    private getRefer<K extends keyof R>(origin: R, key: K & string) {
        if (!origin[key]) {
            const model = this.queryChild(this.referOrigin[key]);
            if (!model) return undefined;
            Reflect.set(origin, key, model);
            model?.referConsumers.push(this);
        }
        return origin[key];
    }

    private getChild(origin: Record<string, any>, key: string) {
        const value = origin[key];
        if (value instanceof Model) return value.chunk;
        if (typeof value === 'function' && typeof key === 'string') {
            return this.operateChild.bind(origin, key);
        } 
        return origin[key].chunk;
    }

    @Model.useFiber()
    private operateChild(origin: any, key: string, ...args: any[]) {
        const operator = origin[key];
        return operator.call(origin, ...args);
    }

    @Model.useFiber()
    private setChild(origin: Record<string, Model>, key: string, props: any) {
        origin[key] = this.createChild(props, key); return true;
    }

    @Model.useFiber()
    private deleteChild(origin: Record<string, Model>, key: string) {
        delete origin[key]; return true;
    }

    private createChild<M extends Model>(chunk: Model.Chunk<M>, key: string): Model {
        const props: Model.Props<M> = {
            ...chunk,
            parent: this,
            key,
            uuid: chunk.uuid ?? ''
        }
        return new chunk.type(props)
    }

    @Model.useFiber()
    private deleteState(origin: S & D, key: string) {
        Reflect.deleteProperty(origin, key); return true;
    }

    @Model.useFiber()
    private setState(origin: S & D, key: any, value: any) {
        Reflect.set(origin, key, value); return true;
    }

    @Model.useFiber()
    private markState(key: keyof S & keyof D) {
        
    }

    private getEvent<
        K extends keyof T & string,
        T extends Record<string, EventProducer>
    >(origin: T, key: K) {
        return origin[key] = origin[key] ?? new EventProducer(this, key);
    }

    private getDecor<
        K extends keyof T & string, 
        T extends Record<string, DecorReceiver>
    >(origin: T, key: K) {
        return origin[key] = origin[key] ?? new DecorReceiver(this, key);
    }

    private getEventEmitter(origin: EventEmitters<E>, key: keyof EventEmitters<E> & string) {
        return this.emitEvent.bind(this, key);
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
            const key = isNaN(Number(parent.key)) ? parent.key : '0';
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
        const { target } = producer;
        const consumers = target.eventConsumers.get(producer.path) ?? [];
        consumers.push({ target: this, handler });
        target.eventConsumers.set(producer.path, consumers);
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
            const { target } = producerTemp;
            const consumers = target.eventConsumers.get(producerTemp.path)?.filter(item => item.handler !== handler) ?? [];
            target.eventConsumers.set(producerTemp.path, consumers);
        }
        const producersNext = producer ? producers.filter(producerCur => producerCur !== producer) : [];
        this.eventProducers.set(handler, producersNext);
    }

    protected bindDecor<S, M extends Model>(
        receiver: DecorReceiver<S, M>,
        updater: DecorUpdater<S, M>
    ) {
        const { target } = receiver;
        const providers = target.decorProviders.get(receiver.path) ?? [];
        providers.push({ target: this, updater });
        target.decorProviders.set(receiver.path, providers);
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
            const { target } = receiverTemp;
            const providers = target.decorProviders.get(receiverTemp.path)?.filter(item => item.updater !== updater) ?? [];
            target.decorProviders.set(receiverTemp.path, providers);
        }
        const receiversNext = receiver ? receivers.filter(receiverCur => receiverCur !== receiver) : [];
        this.eventProducers.set(updater, receiversNext);
        // emit recheck 
    }

    private init() {
        Object.values(this.child).forEach(child => child.init());
        this.childGroup.forEach(child => child.init());
        
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
        this.childGroup.forEach(child => child.uninit());

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

    private refresh() {
        if (!this.cache) return;
        const childPrev = this.cache.child;
        const childNext = this.child;
        const childGroupPrev = this.cache.childGroup;
        const childGroupNext = this.childGroup;
        const referPrev = this.cache.refer;
        const referNext = this.refer;
        const referGroupPrev = this.cache.referGroup;
        const referGroupNext = this.referGroup;

        this.emitEvent('onChildChange', { prev: childPrev, next: childNext, prevGroup: childGroupPrev, nextGroup: childGroupNext });
        this.emitEvent('onReferChange', { prev: referPrev, next: referNext, prevGroup: referGroupPrev, nextGroup: referGroupNext });
        this.emitEvent('onStateChange', { prev: this.state, next: this.state });
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

    private static fibers: Model[] = [];
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
                    if (Model.fibers.includes(this)) return handler.apply(this, args);
                    Model.fibers.push(this);
                    this.cache = {
                        state: { ...this.stateOrigin },
                        child: { ...this.childOrigin },
                        childGroup: [ ...this.childGroupOrigin ],
                        refer: { ...this.referAgent },
                        referGroup: [ ...this.referGroupAgent ],
                    }
                    if (Model.isFiberic) return handler.apply(this, args);
                    Model.isFiberic = true;
                    console.log('Fiberic+ ============')
                    const result = handler.apply(this, args);
                    for (const fiber of Model.fibers) {

                    }
                    Model.fibers.forEach(model => model.refresh())
                    Model.isFiberic = false;
                    Model.fibers = [];
                    console.log('Fiberic- ============')
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }
    
}
