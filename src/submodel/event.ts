import { Model } from "@/model/model";
import { SubModel } from ".";
import { DebugContext } from "@/context/debug";
import { BaseEvent, EventConsumer, EventEmitters, EventHandler, EventProducers } from "@/types/event";

export class EventProducer<E = any, M extends Model = Model> {
    readonly target: M;
    readonly path: string;
    constructor(target: M, path: string) {
        this.target = target;
        this.path = path;
    }
}

export class EventModel<
    E extends Record<string, any> = Record<string, any>,
    M extends Model = Model
> extends SubModel<M> {
    readonly producers: Readonly<EventProducers<E & BaseEvent<M>, M>>;
    readonly emitters: Readonly<EventEmitters<E>>;

    private readonly router: Map<string, EventConsumer[]>;
    private readonly routerInvert: Map<EventHandler, EventProducer[]>;

    constructor(target: M) {
        super(target)
        this.router = new Map();
        this.emitters = new Proxy({} as any, {
            get: this.getEmitter.bind(this)
        })
        this.routerInvert = new Map();
        this.producers = new Proxy({} as any, {
            get: this.getProducer.bind(this)
        })
    }

    @DebugContext.log()
    protected bind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { target, path } = producer;
        const router = target.eventModel.router;
        const consumers = router.get(path) ?? [];
        consumers.push({ target: this.target, handler });
        router.set(path, consumers);
        const producers = this.routerInvert.get(handler) ?? [];
        producers.push(producer);
        this.routerInvert.set(handler, producers);
    }

    @DebugContext.log()
    public emit<E>(key: string, event: E) {
        let target: Model | undefined = this.target;
        let path = key;
        while(target) {
            console.log('emitEvent', path, target.code);
            const router = target.eventModel.router;
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
    protected unbind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { target, path } = producer;
        const router = target.eventModel.router;
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
            const hooks = EventModel.hooks.get(constructor) ?? {};
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
        for (const channel of this.routerInvert) {
            const [ handler, producers ] = channel
            for (const producer of producers) {
                this.unbind(producer, handler);
            }
        }
        for (const channel of this.router) {
            const [ path, consumers ] = channel;
            const producer = this.producers[path];
            for (const consumer of consumers) {
                const { target, handler } = consumer;
                target.eventModel.unbind(producer, handler);
            }
        }
    }

    private getProducer(origin: any, path: string) { 
        const agent = this.target.agent;
        return Reflect.get(agent.event, path)
    }

    private getEmitter(origin: any, path: string) {
        return this.emit.bind(this, path);
    }

    private static hooks: Map<Function, Record<string, 
        Array<(model: Model) => EventProducer | undefined>
    >> = new Map();
    
    public static use<E, M extends Model>(accessor: (model: M) => EventProducer<E, M> | undefined) {
        return function(
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<EventHandler<E, M>>
        ): TypedPropertyDescriptor<EventHandler<E, M>> {
            const hooks = EventModel.hooks.get(target.constructor) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(accessor);
            EventModel.hooks.set(target.constructor, hooks);
            return descriptor;
        };
    }
}