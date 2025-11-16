import { Model } from "../model"
import { Frame } from "../types/model"
import { Util } from ".";
import { IClass, Method } from "../types";
import { DeepReadonly } from "utility-types";
import { Consumer, Emitter, Event, Handler, Producer } from "../types/event";

export class EventUtil<M extends Model, E extends Model.E> extends Util<M> {
    
    // static
    private static registry: {
        checkers: Map<Function, string[]>
        handlers: Map<Function, Record<string, Array<Method<Handler>>>>,
        watchers: Map<Model, Array<[Producer, Handler]>> 
    } = {
        handlers: new Map(),
        checkers: new Map(),
        watchers: new Map(),
    };

    public static bind<E, M extends Model>(
        producer: Producer<E, M> | undefined, 
        handler: Handler<E, M>
    ) {
        if (!producer) return;
        const model = producer.model;

        const watchers = EventUtil.registry.watchers.get(model) ?? [];
        watchers.push([producer, handler]);
        EventUtil.registry.watchers.set(model, watchers);

        model.utils.event.bind(producer, handler);
        return () => EventUtil.unbind(producer, handler)
    }

    public static unbind<E, M extends Model>(
        producer: Producer<E, M> | undefined, 
        handler: Handler<E, M>
    ) {
        if (!producer) return;
        const model = producer.model;

        let watchers = EventUtil.registry.watchers.get(model) ?? [];
        watchers = watchers.filter(item => (
            item[0] === producer &&
            item[1] === handler
        ));
        if (!watchers.length) EventUtil.registry.watchers.delete(model);
        else EventUtil.registry.watchers.set(model, watchers);

        model.utils.event.unbind(producer, handler);
    }

    public static on<E, I extends Model, M extends Model>(
        handler: (self: I) => Handler<E, M>
    ) {
        return function(
            prototype: I,
            key: string,
            descriptor: TypedPropertyDescriptor<() => Producer<E, M> | undefined>
        ): TypedPropertyDescriptor<() => Producer<E, M> | undefined> {
            const type = prototype.constructor;
            const hooks = EventUtil.registry.handlers.get(type) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(handler);
            EventUtil.registry.handlers.set(type, hooks);
            return descriptor;
        };
    }

    public static if<I extends Model>() {
        return function(
            prototype: I,
            key: string,
            descriptor: TypedPropertyDescriptor<() => boolean>
        ): TypedPropertyDescriptor<() => any> {
            const type = prototype.constructor;
            const hooks = EventUtil.registry.checkers.get(type) ?? []
            hooks.push(key);
            EventUtil.registry.checkers.set(type, hooks);
            return descriptor;
        };
    }

    // instance
    public readonly current: Readonly<
        { [K in keyof E]: Emitter<E[K]> } & 
        { onChange: Emitter<Event<Frame<M>>> }
    >;

    private readonly router: Readonly<{
        consumers: Map<Producer, Consumer[]>,
        producers: Map<Handler, Producer[]>
    }>

    public constructor(model: M) {
        super(model);
        this.router = {
            consumers: new Map(),
            producers: new Map()
        }
        this.current = new Proxy({} as any, {
            get: (origin, key: string) => this.emit.bind(this, key)
        })
    }
    
    public emit<E>(name: string, event: E): void {
        const keys: string[] = [];
        const consumers: Consumer[] = [];
        let parent: Model | undefined = this.model;
        while (parent) {
            const router = parent.utils.event.router;
            router.consumers.forEach((items, producer) => {
                if (producer.name !== name) return;
                
                const steps = this.utils.route.locate(producer.model);
                const matched = this.utils.route.validate(steps, producer.keys, name);
                if (!matched) return;
                consumers.push(...items);
            })
            const key = parent.utils.route.key;
            if (key) keys.unshift(key);
            parent = parent.utils.route.current.parent;
        }
        consumers.sort((a, b) => a.model.uuid.localeCompare(b.model.uuid));
        consumers.forEach(item => {
            item.handler.call(item.model, this.model, event);
        });
        return;
    }

    
    public bind<E, M extends Model>(
        producer: Producer<E, M>, 
        handler: Handler<E, M>
    ) {
        const { model: that } = producer;
        if (!this.utils.route.compare(that)) return;
        const consumers = that.utils.event.router.consumers.get(producer) ?? [];
        const producers = this.router.producers.get(handler) ?? [];
        consumers.push({ model: this.model, handler });
        producers.push(producer);
        that.utils.event.router.consumers.set(producer, consumers);
        this.router.producers.set(handler, producers);
    }

    public unbind<E, M extends Model>(
        producer: Producer<E, M>, 
        handler: Handler<E, M>
    ) {
        const { model: that } = producer;
        const consumers = that.utils.event.router.consumers.get(producer) ?? [];
        const producers = this.router.producers.get(handler) ?? [];
        let index = consumers.findIndex(item => (
            item.handler === handler && 
            item.model === this.model
        ));
        if (index !== -1) consumers.splice(index, 1);
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
    }


    public load() {
        // bystander
        const watchers = EventUtil.registry.watchers.get(this.model);
        if (watchers) watchers.forEach(([producer, handler]) => {
            this.bind(producer, handler)
        })
        // check
        let constructor: any = this.model.constructor;
        while (constructor) {
            const keys = EventUtil.registry.checkers.get(constructor) ?? [];
            for (const key of keys) {
                const validator: any = Reflect.get(this.model, key);
                if (!validator) continue;
                if (!validator.call(this.model)) return;
            }
            constructor = constructor.__proto__;
        }
        // load
        constructor = this.model.constructor;
        while (constructor) {
            const registry = EventUtil.registry.handlers.get(constructor) ?? {};
            Object.keys(registry).forEach(key => {
                // get producer
                const producerFact: any = Reflect.get(this.model, key);
                if (!producerFact) return;
                const producer: Producer = producerFact.bind(this.model)();
                // cancel
                if (!producer) return;
                
                // get handlers
                const handlersFact = registry[key]
                const handlers = handlersFact?.map(item => {
                    return item.bind(this.model)(this.model);
                });
                // bind
                handlers?.forEach(item => this.bind(producer, item));
            })
            constructor = constructor.__proto__
        }
    }

    public unload() {
        // producers
        this.router.producers.forEach((items, handler) => {
            [...items].forEach(item => {
                this.unbind(item, handler)
            });
        })
        // consumers
        this.router.consumers.forEach((items, producer) => {
            [...items].forEach(item => {
                const { model: that, handler } = item;
                if (this.utils.route.compare(that)) return;
                that.utils.event.unbind(producer, handler);
            })
        })
    }

    public reload() {
        this.unload();
        this.load();
    }
}