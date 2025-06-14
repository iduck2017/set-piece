import { EventConsumer, EventHandler, EventProducer } from "../utils/event";
import { Model } from "../model";
import { Agent } from "./agent";
import { Event } from "../types";

export class EventAgent<
    M extends Model = Model,
    E extends Model.Event = Model.Event,
> extends Agent<M> {
    
    public readonly current: Readonly<
        { [K in keyof E]: (event: E[K]) => void } &
        { [K in keyof Event<M>]: (event: Event<M>[K]) => void }
    >;
    
    private readonly router: Readonly<{
        consumers: Map<string, EventConsumer[]>,
        producers: Map<EventHandler, EventProducer[]>
    }>
    
    public constructor(model: M) {
        super(model)
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
        let model: Model | undefined = this.model;
        while(model) {
            const router = model.agent.event.router;
            const consumers = router.consumers.get(path) ?? [];
            for (const consumer of [ ...consumers ]) {
                const that = consumer.model;
                const handler = consumer.handler;
                handler.call(that, this.model, event);
            }
            path = model.agent.route.key + '/' + path;
            model = model.agent.route.parent;
        }
    }

    public bind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { model: that, path } = producer;
        if (this.agent.route.root !== that.agent.route.root) return;
        const consumers = that.agent.event.router.consumers.get(path) ?? [];
        consumers.push({ model: this.model, handler });
        that.agent.event.router.consumers.set(path, consumers);
        const producers = this.router.producers.get(handler) ?? [];
        producers.push(producer);
        this.router.producers.set(handler, producers);
    }

    public unbind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { model: that, path } = producer;
        const consumers = that.agent.event.router.consumers.get(path) ?? [];
        let index = consumers.findIndex(item => (
            item.handler === handler && 
            item.model === this.model
        ));
        if (index !== -1) consumers.splice(index, 1);
        const producers = this.router.producers.get(handler) ?? [];
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
    }

    public load() {
        let constructor: any = this.model.constructor;
        while (constructor) {
            const hooks = EventAgent.reg.get(constructor) ?? {};
            Object.keys(hooks).forEach(key => {
                const accessors = hooks[key] ?? [];
                accessors.forEach(accessor => {
                    const producer = accessor(this.model);
                    if (!producer) return;
                    const model: any = this.model;
                    this.bind(producer, model[key]);
                })
            })
            constructor = constructor.__proto__
        }
    }

    public unload() {
        for (const channel of this.router.producers) {
            const [ handler, producers ] = channel;
            [ ...producers ].forEach(producer => this.unbind(producer, handler));
        }
        for (const channel of this.router.consumers) {
            const [ path, consumers ] = channel;
            const keys = path.split('/');
            const key = keys.pop();
            if (!key) continue;
            
            const proxy: any = this.model.proxy;
            const producer = proxy.child[keys.join('/')].event[key];
            if (!producer) continue;
            for (const consumer of [ ...consumers ]) {
                const { model: that, handler } = consumer;
                if (that.agent.route.root !== this.agent.route.root) continue;
                that.agent.event.unbind(producer, handler);
            }
        }
    }

    public debug(): Model[] {
        const dependency: Model[] = [];
        this.router.producers.forEach((value) => {
            dependency.push(...value.map(item => item.model));
        })
        this.router.consumers.forEach((value) => {
            dependency.push(...value.map(item => item.model));
        })
        return dependency;
    }




    private static reg: Map<Function, 
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
            const hooks = EventAgent.reg.get(target.constructor) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(accessor);
            EventAgent.reg.set(target.constructor, hooks);
            return descriptor;
        };
    }



}

