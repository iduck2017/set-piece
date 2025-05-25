import { Model } from "../model";
import { Agent } from "./agent";

export type OnStateChange<M extends Model> = { prev: Model.State<M>, next: Model.State<M> };

export type OnChildChange<M extends Model> = { prev: Model.Child<M>, next: Model.Child<M> };

export type OnReferChange<M extends Model> = { prev: Model.Refer<M>, next: Model.Refer<M> };

export type OnParentChange<M extends Model> = { prev: Model.Parent<M>, next: Model.Parent<M> }

export type BaseEvent<M extends Model> = {
    onStateChange: OnStateChange<M>
    onChildChange: OnChildChange<M>
    onReferChange: OnReferChange<M>
    onParentChange: OnParentChange<M>
}

export class EventAgent<
    M extends Model = Model,
    E extends Record<string, any> = {},
> extends Agent<M> {
    public readonly current: Readonly<EventEmitter<E & BaseEvent<M>>>;
    
    private readonly router: Readonly<{
        consumers: Map<string, EventConsumer[]>,
        producers: Map<EventHandler, EventProducer[]>
    }>
    
    public constructor(target: M) {
        super(target)
        this.router = {
            consumers: new Map(),
            producers: new Map()
        }
        this.current = new Proxy({} as any, {
            get: (origin: never, key: string) => this.emit.bind(this, key)
        })
    }

    public emit<E>(key: string, event: E) {
        if (!this.agent.route.isLoad) return;

        let target: Model | undefined = this.target;
        let path = key;
        while(target) {
            const router = target.agent.event.router;
            const consumers = router.consumers.get(path) ?? [];
            for (const consumer of [ ...consumers ]) {
                const target = consumer.target;
                const handler = consumer.handler;
                handler.call(target, this.target, event);
            }
            path = target.agent.route.key + '/' + path;
            target = target.agent.route.parent;
        }
    }


    public bind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { target, path } = producer;
        const router = target.agent.event.router;

        const consumers = router.consumers.get(path) ?? [];
        const consumer: EventConsumer = { target: this.target, handler }
        consumers.push(consumer);
        router.consumers.set(path, consumers);
        
        const producers = this.router.producers.get(handler) ?? [];
        producers.push(producer);
        this.router.producers.set(handler, producers);
    }



    public unbind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { target, path } = producer;
        
        let index;

        const router = target.agent.event.router;
        const consumers = router.consumers.get(path) ?? [];
        index = consumers.findIndex(item => (
            item.handler === handler && 
            item.target === this.target
        ));
        if (index !== -1) consumers.splice(index, 1);
        
        const producers = this.router.producers.get(handler) ?? [];
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
    
    }

    public load() {
        let constructor: any = this.target.constructor;
        while (constructor) {
            const hooks = EventAgent.registry.get(constructor) ?? {};
            for (const key of Object.keys(hooks)) {
                const accessors = hooks[key] ?? [];
                for (const accessor of [ ...accessors ]) {
                    const producer = accessor(this.target);
                    if (!producer) continue;
                    const target: any = this.target;
                    this.bind(producer, target[key]);
                }
            }
            constructor = constructor.__proto__
        }
    }

    public unload() {
        for (const channel of this.router.producers) {
            const [ handler, producers ] = channel;
            for (const producer of [ ...producers ]) {
                this.unbind(producer, handler);
            }
        }
    }

    public uninit() {
        for (const channel of this.router.consumers) {
            const [ path, consumers ] = channel;
            const event: Record<string, EventProducer> = this.target.proxy.event;
            const producer: EventProducer | undefined = event[path];
            if (!producer) continue;
            for (const consumer of [ ...consumers ]) {
                const { target, handler } = consumer;
                target.agent.event.unbind(producer, handler);
            }
        }
    }


    private static registry: Map<Function, Record<string, Array<(model: Model) => EventProducer | undefined>>> = new Map();


    public static use<E, M extends Model, I extends Model>(
        accessor: (model: I) => EventProducer<E, M> | undefined
    ) {
        return function(
            target: I,
            key: string,
            descriptor: TypedPropertyDescriptor<EventHandler<E, M>>
        ): TypedPropertyDescriptor<EventHandler<E, M>> {
            const hooks = EventAgent.registry.get(target.constructor) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(accessor);
            EventAgent.registry.set(target.constructor, hooks);
            return descriptor;
        };
    }

}


export class EventProducer<E = any, M extends Model = Model> {
   
    public readonly path: string;
    
    public readonly target: M;
    
    public constructor(target: M, path: string) {
        this.path = path;
        this.target = target;
    }
}

export type EventHandler<E = any, M extends Model = Model> = (target: M, event: E) => void

export type EventEmitter<E = Record<string, any>> = { [K in keyof E]: (event: E[K]) => void }

export type EventConsumer = { target: Model, handler: EventHandler }