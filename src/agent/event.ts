import { Model } from "../model";
import { Agent } from "./agent";

export type OnStateChange<M extends Model> = { prev: M['state'], next: M['state'] };

export type OnChildChange<M extends Model> = { prev: M['child'], next: M['child'] };

export type OnReferChange<M extends Model> = { prev: M['refer'], next: M['refer'] };

export type OnRouteChange<M extends Model> = { prev: M['route'], next: M['route'] }

export type BaseEvent<M extends Model> = {
    onStateChange: OnStateChange<M>
    onChildChange: OnChildChange<M>
    onReferChange: OnReferChange<M>
    onRouteChange: OnRouteChange<M>
}

type EventHandler<E = any, M extends Model = Model> = (target: M, event: E) => void

type EventConsumer = { target: Model, handler: EventHandler }

export class EventProducer<E = any, M extends Model = Model> {
   
    public readonly path: string;
    
    public readonly target: M;
    
    public constructor(target: M, path: string) {
        this.path = path;
        this.target = target;
    }
}


export class EventAgent<
    M extends Model = Model,
    E extends Model.E = Model.E,
> extends Agent<M> {
    
    public readonly current: Readonly<
        { [K in keyof E]: (event: E[K]) => void } &
        { [K in keyof BaseEvent<M>]: (event: BaseEvent<M>[K]) => void }
    >;
    
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
        let path = key;
        let target: Model | undefined = this.target;
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

        if (this.target.agent.route.root !== target.agent.route.root) return;

        const consumers = target.agent.event.router.consumers.get(path) ?? [];
        consumers.push({ target: this.target, handler });
        target.agent.event.router.consumers.set(path, consumers);
        
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
        const consumers = target.agent.event.router.consumers.get(path) ?? [];
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
        for (const channel of this.router.consumers) {
            const [ path, consumers ] = channel;
            const event: Record<string, EventProducer> = this.target.proxy.event;
            const producer: EventProducer | undefined = event[path];
            if (!producer) continue;

            for (const consumer of [ ...consumers ]) {
                const { target, handler } = consumer;
                if (target.agent.route.root !== this.target.agent.route.root) continue;
                target.agent.event.unbind(producer, handler);
            }
        }
    }

    public debug(): Model[] {
        const dependency: Model[] = [];
        this.router.producers.forEach((value) => {
            dependency.push(...value.map(item => item.target));
        })
        this.router.consumers.forEach((value) => {
            dependency.push(...value.map(item => item.target));
        })
        return dependency;
    }




    private static registry: Map<Function, 
        Record<string, Array<(model: Model) => EventProducer | undefined>>
    > = new Map();

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

