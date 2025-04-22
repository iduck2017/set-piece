import { Model } from "@/model";
import { Callback } from "@/types";
import { Agent } from ".";
import { DebugContext } from "@/context/debug";
import { 
    BaseEvent, 
    EventHandler, 
    EventConsumer, 
    EventEmitters, 
    EventProducers, 
} from "@/types/event";

export class EventProducer<E = any, M extends Model = Model> {
    public readonly path: string;
    public readonly target: M;
    
    public constructor(target: M, path: string) {
        this.path = path;
        this.target = target;
    }
}

type ProducerAccessor = Callback<EventProducer | undefined, [Model]>

export class EventAgent<
    E extends Record<string, any> = Record<string, any>,
    M extends Model = Model
> extends Agent<M> {
    public readonly producers = {} as Readonly<EventProducers<E & BaseEvent<M>, M>>;
    
    public readonly emitters = {} as Readonly<EventEmitters<E>>;
    
    private readonly router: Map<string, EventConsumer[]>;
    
    private readonly routerInvert: Map<EventHandler, EventProducer[]>;
    
    public constructor(target: M) {
        super(target)
        this.producers = new Proxy(this.producers, {
            get: this.getProducer.bind(this)
        })
        this.emitters = new Proxy(this.emitters, {
            get: this.getEmitter.bind(this)
        })
        this.router = new Map();
        this.routerInvert = new Map();
    }

    private getProducer(origin: never, path: string) { 
        const agent = this.agent.decoy;
        const producer: EventProducer = Reflect.get(agent.event, path)
        return producer;
    }
    
    private getEmitter(origin: never, path: string) {
        return this.emit.bind(this, path);
    }

    @DebugContext.log()
    public emit<E>(key: string, event: E) {
        let target: Model | undefined = this.target;
        let path = key;
        while(target) {
            console.log('emitEvent', path, target.code);
            const router = target.agent.event.router;
            const consumers = router.get(path) ?? [];
            for (const consumer of consumers) {
                const target = consumer.target;
                const handler = consumer.handler;
                handler.call(target, this.target, event);
            }
            path = target.path + '/' + path;
            target = target.parent;
        }
    }

    @DebugContext.log()
    public bind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { target, path } = producer;
        const router = target.agent.event.router;
        const consumers = router.get(path) ?? [];
        const consumer: EventConsumer = { target: this.target, handler }
        consumers.push(consumer);
        router.set(path, consumers);
        const producers = this.routerInvert.get(handler) ?? [];
        producers.push(producer);
        this.routerInvert.set(handler, producers);
    }

    @DebugContext.log()
    public unbind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { target, path } = producer;
        const router = target.agent.event.router;
        let consumers = router.get(path) ?? [];
        consumers = consumers.filter(item => {
            if (item.handler !== handler) return true;
            if (item.target !== this.target) return true;
            return false;
        });
        router.set(path, consumers);
        let producers = this.routerInvert.get(handler) ?? [];
        producers = producers.filter(item => item !== producer);
        this.routerInvert.set(handler, producers);
    }

    @DebugContext.log()
    public load() {
        let constructor = this.target.constructor;
        const target = this.target;
        while (constructor) {
            const hooks = EventAgent.registry.get(constructor) ?? {};
            for (const key of Object.keys(hooks)) {
                const accessors = hooks[key];
                for (const accessor of accessors) {
                    const producer = accessor(target);
                    if (!producer) continue;
                    const handler: any = Reflect.get(target, key)
                    this.bind(producer, handler);
                }
            }
            constructor = Reflect.get(constructor, '__proto__');
        }
    }

    @DebugContext.log()
    public unload() {
        for (const channel of this.router) {
            const [ path, consumers ] = channel;
            const producer = this.producers[path];
            for (const consumer of consumers) {
                const { target, handler } = consumer;
                target.agent.event.unbind(producer, handler);
            }
        }
    }

    @DebugContext.log()
    public destroy() {
        for (const channel of this.routerInvert) {
            const [ handler, producers ] = channel
            for (const producer of producers) {
                this.unbind(producer, handler);
            }
        }
    }

    private static registry: Map<Function, Record<string, ProducerAccessor[]>> = new Map();
    public static use<E, M extends Model>(accessor: ProducerAccessor) {
        return function(
            target: M,
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