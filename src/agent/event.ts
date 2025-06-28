import { EventConsumer, EventHandler, EventProducer } from "../utils/event";
import { Model } from "../model";
import { Agent } from "./agent";
import { Callback, Decorator, Event } from "../types";
import { DebugService, LogLevel } from "../service/debug";
import { TranxService } from "../service/tranx";

@DebugService.is(self => `${self.model.name}::event`)
export class EventAgent<
    M extends Model = Model,
    E extends Model.Event = Model.Event,
> extends Agent<M> {
    
    private static registry: Map<Function, Record<string, Array<(self: Model) => EventProducer | undefined>>> = new Map();

    public static use<E, M extends Model, I extends Model>(
        accessor: (self: I) => EventProducer<E, M> | undefined
    ) {
        return function(
            prototype: I,
            key: string,
            descriptor: TypedPropertyDescriptor<EventHandler<E, M>>
        ): TypedPropertyDescriptor<EventHandler<E, M>> {
            const hooks = EventAgent.registry.get(prototype.constructor) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(accessor);
            EventAgent.registry.set(prototype.constructor, hooks);
            return descriptor;
        };
    }

    public static prev<E, M extends Model>(
        accessor: Callback<Callback<unknown, [E]> | undefined, [M]>
    ) {
        return function(
            prototype: M,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback<unknown, [E]>>
        ): TypedPropertyDescriptor<Callback<unknown, [E]>> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: M, event: E) {
                    accessor(this)?.(event);
                    return handler.call(this, event);
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        };
    }

    public static next<E, M extends Model>(accessor: Callback<Callback<unknown, [E]> | undefined, [M, E]>): Decorator<M, E>;
    public static next<E, M extends Model>(accessor: Callback<Callback<unknown, [E]> | undefined, [M, E]>, mode: 'async'): Decorator<M, Promise<E>>;
    public static next<E, M extends Model>(
        accessor: Callback<Callback<unknown, [E]> | undefined, [M, E]>,
        mode?: 'async'
    ) {
        return function(
            prototype: M,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback<E | Promise<E>>>
        ): TypedPropertyDescriptor<Callback<E | Promise<E>>> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: M, ...args: any[]) {
                    const result = handler.call(this, ...args);
                    if (result instanceof Promise) return result.then((result) => {
                        accessor(this, result)?.(result);
                        return result;
                    });
                    else accessor(this, result)?.(result);
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        };
    }
    
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
            get: (origin, key: string) => this.yield.bind(this, key)
        })
    }

    @TranxService.use()
    public yield(key: string, event: E) {}

    @DebugService.log(LogLevel.DEBUG)
    public emit<E>(key: string, event: E) {
        let path = key;
        let parent: Model | undefined = this.model;
        const consumers: EventConsumer[] = [];
        while (parent) {
            const router = parent.agent.event.router;
            consumers.push(...router.consumers.get(path) ?? []);
            path = parent.agent.route.key + '/' + path;
            parent = parent.agent.route.parent;
        }
        consumers.sort((a, b) => a.model.uuid.localeCompare(b.model.uuid));
        consumers.forEach(item => item.handler.call(item.model, this.model, event));
    }

    public bind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { model: that, path } = producer;
        if (this.agent.route.root !== that.agent.route.root) return;
        const consumers = that.agent.event.router.consumers.get(path) ?? [];
        const producers = this.router.producers.get(handler) ?? [];
        consumers.push({ model: this.model, handler });
        producers.push(producer);
        that.agent.event.router.consumers.set(path, consumers);
        this.router.producers.set(handler, producers);
    }

    public unbind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { model: that, path } = producer;
        const consumers = that.agent.event.router.consumers.get(path) ?? [];
        const producers = this.router.producers.get(handler) ?? [];
        let index = consumers.findIndex(item => item.handler === handler && item.model === this.model);
        if (index !== -1) consumers.splice(index, 1);
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
    }

    public load() {
        let constructor: any = this.model.constructor;
        while (constructor) {
            const hooks = EventAgent.registry.get(constructor) ?? {};
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
        this.router.producers.forEach((producers, handler) => {
            [...producers].forEach(producer => this.unbind(producer, handler));
        })
        this.router.consumers.forEach((consumers, path) => {
            const keys = path.split('/');
            const key = keys.pop();
            if (!key) return;
            const proxy: any = this.model.proxy;
            const producer = proxy.child[keys.join('/')].event[key];
            [...consumers].forEach(consumer => {
                const { model: that, handler } = consumer;
                if (that.agent.route.root !== this.agent.route.root) return;
                that.agent.event.unbind(producer, handler);
            })
        })
    }

    public debug(): Model[] {
        const dependency: Model[] = [];
        this.router.producers.forEach(item => dependency.push(...item.map(item => item.model)))
        this.router.consumers.forEach(item => dependency.push(...item.map(item => item.model)))
        return dependency;
    }

}

