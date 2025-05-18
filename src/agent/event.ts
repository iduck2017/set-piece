import { Model } from "@/model";
import { Agent } from ".";
import { DebugService } from "@/service/debug";
import { 
    EventHandler, 
    EventConsumer, 
    EventEmitters,
    BaseEvent, 
} from "@/types/event";

export class EventProducer<E = any, M extends Model = Model> {
   
    public readonly path: string;
    
    public readonly type: 'event';
    
    public readonly target: M;
    
    public constructor(target: M, path: string) {
        this.path = path;
        this.type = 'event';
        this.target = target;
    }
}

@DebugService.is(target => target.target.name + '::event')
export class EventAgent<
    E extends Record<string, any> = Record<string, any>,
    M extends Model = Model
> extends Agent<M> {
    public readonly emitters: Readonly<EventEmitters<E & BaseEvent<M>>>;
    
    private readonly _router: Readonly<{
        consumers: Map<string, EventConsumer[]>,
        producers: Map<EventHandler, EventProducer[]>
    }>
    
    public constructor(target: M) {
        super(target)
        this._router = {
            consumers: new Map(),
            producers: new Map()
        }
        this.emitters = new Proxy({} as any, {
            get: this._get.bind(this)
        })
    }



    private _get(origin: never, path: string) {
        return this.emit.bind(this, path);
    }

    @DebugService.log()
    public emit<E>(key: string, event: E) {
        console.log('emit', key);
        if (!this.target._cycle.isLoad) return;

        let target: Model | undefined = this.target;
        let path = key;
        while(target) {
            console.log('event', path);
            const router = target._agent.event._router;
            const consumers = router.consumers.get(path) ?? [];
            for (const consumer of [...consumers]) {
                const target = consumer.target;
                const handler = consumer.handler;
                handler.call(target, this.target, event);
            }
            path = target._cycle.path + '/' + path;
            target = target._cycle.parent;
        }
    }


    @DebugService.log()
    public bind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        console.log('event', producer.path);

        const { target, path } = producer;
        const router = target._agent.event._router;

        const consumers = router.consumers.get(path) ?? [];
        const consumer: EventConsumer = { target: this.target, handler }
        consumers.push(consumer);
        router.consumers.set(path, consumers);
        
        const producers = this._router.producers.get(handler) ?? [];
        producers.push(producer);
        this._router.producers.set(handler, producers);
    }



    @DebugService.log()
    public unbind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        console.log('event', producer.path);
        
        const { target, path } = producer;
        
        let index;

        const router = target._agent.event._router;
        const consumers = router.consumers.get(path) ?? [];
        index = consumers.findIndex(item => (
            item.handler === handler && 
            item.target === this.target
        ));
        if (index !== -1) consumers.splice(index, 1);
        
        const producers = this._router.producers.get(handler) ?? [];
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
    
    }

    public load() {
        let constructor = this.target.constructor;
        while (constructor) {
            const hooks = EventAgent._registry.get(constructor) ?? {};
            for (const key of Object.keys(hooks)) {
                const accessors = hooks[key];
                for (const accessor of accessors) {
                    const producer = accessor(this.target);
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
        for (const channel of this._router.producers) {
            const [ handler, producers ] = channel;
            for (const producer of [...producers]) {
                this.unbind(producer, handler);
            }
        }
    }

    @DebugService.log()
    public uninit() {
        for (const channel of this._router.consumers) {
            const [ path, consumers ] = channel;
            const proxy = this.target.proxy;
            const producer: EventProducer = Reflect.get(proxy.event, path);
            for (const consumer of [...consumers]) {
                const { target, handler } = consumer;
                target._agent.event.unbind(producer, handler);
            }
        }
    }


    private static _registry: Map<Function, Record<string, Array<(model: Model) => EventProducer | undefined>>> = new Map();


    public static use<E, M extends Model, I extends Model>(
        accessor: (model: I) => EventProducer<E, M> | undefined
    ) {
        return function(
            target: I,
            key: string,
            descriptor: TypedPropertyDescriptor<EventHandler<E, M>>
        ): TypedPropertyDescriptor<EventHandler<E, M>> {
            const hooks = EventAgent._registry.get(target.constructor) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(accessor);
            EventAgent._registry.set(target.constructor, hooks);
            return descriptor;
        };
    }
    
}