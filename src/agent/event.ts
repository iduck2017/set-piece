import { Model } from "@/model";
import { Agent } from ".";
import { DebugService } from "@/service/debug";
import { 
    EventHandler, 
    EventConsumer, 
    EventEmitters, 
} from "@/types/event";
import { ModelProxy } from "@/utils/proxy";
import { ModelStatus } from "@/types/model";

export class EventProducer<E = any, M extends Model = Model> {
    public readonly path: string;
    
    public readonly target: M;
    
    public constructor(target: M, path: string) {
        this.path = path;
        this.target = target;
    }
}

export class EventAgent<
    E extends Record<string, any> = Record<string, any>,
    M extends Model = Model
> extends Agent<M> {
    public readonly emitters: Readonly<EventEmitters<E>>;
    
    private readonly router: Map<string, EventConsumer[]>;
    
    private readonly routerInvert: Map<EventHandler, EventProducer[]>;
    
    public constructor(target: M) {
        super(target)
        this.router = new Map();
        this.routerInvert = new Map();
        this.emitters = new Proxy({} as any, {
            get: this.get.bind(this)
        })
    }

    private get(origin: never, path: string) {
        return this.emit.bind(this, path);
    }

    @DebugService.log()
    public emit<E>(key: string, event: E) {
        if (this.target.status !== ModelStatus.LOAD) return;

        let target: Model | undefined = this.target;
        let path = key;
        while(target) {
            console.log('emitEvent', path, target.constructor.name);
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


    @DebugService.log()
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



    @DebugService.log()
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



    @DebugService.log()
    public load() {
        let constructor = this.target.constructor;
        while (constructor) {
            const hooks = EventAgent.registry.get(constructor) ?? {};
            for (const key of Object.keys(hooks)) {
                const accessors = hooks[key];
                for (const accessor of accessors) {
                    const producer = accessor(this.target.proxy);
                    if (!producer) continue;
                    const handler: any = Reflect.get(this.target, key)
                    this.bind(producer, handler);
                }
            }
            constructor = (constructor as any).__proto__
        }
    }


    @DebugService.log()
    public unload() {
        for (const channel of this.routerInvert) {
            const [ handler, producers ] = channel
            for (const producer of producers) {
                this.unbind(producer, handler);
            }
        }
    }

    @DebugService.log()
    public destroy() {
        for (const channel of this.router) {
            const [ path, consumers ] = channel;
            const proxy = this.target.proxy;
            const producer: EventProducer = Reflect.get(proxy.event, path);
            for (const consumer of consumers) {
                const { target, handler } = consumer;
                target.agent.event.unbind(producer, handler);
            }
        }
    }

    private static registry: Map<Function, Record<string, Array<(proxy: ModelProxy) => EventProducer | undefined>>> = new Map();

    public static use<E, M extends Model, I extends Model>(
        accessor: (agent: Model.Proxy<I>) => EventProducer<E, M> | undefined
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