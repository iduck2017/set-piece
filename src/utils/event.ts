import { EventConsumer, EventEmitter, EventHandler, EventProducer } from "../types/event";
import { Model } from "../model";
import { Util } from ".";
import { Callback, Decorator } from "../types";
import { DebugUtil, LogLevel } from "./debug";
import { Event } from "../types/model";
import { AgentUtil } from "./agent";

@DebugUtil.is(self => `${self.model.name}::event`)
export class EventUtil<
    M extends Model = Model,
    E extends Model.Event = Model.Event,
> extends Util<M> {
    
    private static registry: Map<Function, Record<string, Array<(self: Model) => EventProducer | undefined>>> = new Map();

    public static on<E, M extends Model, I extends Model>(
        accessor: (self: I) => EventProducer<E, M> | undefined
    ) {
        return function(
            prototype: I,
            key: string,
            descriptor: TypedPropertyDescriptor<EventHandler<E, M>>
        ): TypedPropertyDescriptor<EventHandler<E, M>> {
            const hooks = EventUtil.registry.get(prototype.constructor) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(accessor);
            EventUtil.registry.set(prototype.constructor, hooks);
            return descriptor;
        };
    }

    private static _isLock = false;
    public static get isLock() { return EventUtil._isLock; }

    private static tasks: Callback[] = [];
    
    public static then<T>() {
        return function(
            prototype: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback<T | undefined>>
        ): TypedPropertyDescriptor<Callback<T | undefined>> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: unknown, ...args: any[]) {
                    if (!EventUtil._isLock) return handler.call(this, ...args);
                    EventUtil.tasks.push(() => handler.call(this, ...args));
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

    public static span() {
        return function(
            prototype: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: unknown, ...args: any[]) {
                    if (EventUtil._isLock) {
                        return handler.call(this, ...args);
                    }
                    EventUtil._isLock = true;
                    const result = handler.call(this, ...args);
                    if (result instanceof Promise) {
                        result.then(() => {
                            EventUtil._isLock = false;
                            EventUtil.end();
                        })
                    } else {
                        EventUtil._isLock = false;
                        EventUtil.end();
                    }
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

    private static end() {
        const tasks = [...EventUtil.tasks];
        EventUtil.tasks = [];
        tasks.forEach(callback => callback());
    }

    public readonly current: Readonly<
        { [K in keyof E]: EventEmitter<E[K]> } &
        { [K in keyof Event<M>]: EventEmitter<Event<M>[K]> }
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
            get: (origin, key: string) => this.emit.bind(this, key)
        })
    }

    @DebugUtil.log(LogLevel.DEBUG)
    public emit<E>(key: string, event: E, isYield: boolean = true): boolean {
        if (isYield && EventUtil.isLock) {
            EventUtil.tasks.push(() => this.emit(key, event, false));
            return false;
        }
        let path = key;
        let parent: Model | undefined = this.model;
        const consumers: EventConsumer[] = [];
        while (parent) {
            const router = parent.utils.event.router;
            consumers.push(...router.consumers.get(path) ?? []);
            path = parent.utils.route.key + '/' + path;
            parent = parent.utils.route.parent;
        }
        consumers.sort((a, b) => a.model.uuid.localeCompare(b.model.uuid));
        let isAbort: boolean | void = false;
        consumers.forEach(item => {
            isAbort = isAbort || item.handler.call(item.model, this.model, event);
        });
        return isAbort;
    }

    public bind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { model: that, path } = producer;
        if (this.utils.route.root !== that.utils.route.root) return;
        const consumers = that.utils.event.router.consumers.get(path) ?? [];
        const producers = this.router.producers.get(handler) ?? [];
        consumers.push({ model: this.model, handler });
        producers.push(producer);
        that.utils.event.router.consumers.set(path, consumers);
        this.router.producers.set(handler, producers);
    }

    public unbind<E, M extends Model>(
        producer: EventProducer<E, M>, 
        handler: EventHandler<E, M>
    ) {
        const { model: that, path } = producer;
        const consumers = that.utils.event.router.consumers.get(path) ?? [];
        const producers = this.router.producers.get(handler) ?? [];
        let index = consumers.findIndex(item => item.handler === handler && item.model === this.model);
        if (index !== -1) consumers.splice(index, 1);
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
    }

    public load() {
        let constructor: any = this.model.constructor;
        while (constructor) {
            const hooks = EventUtil.registry.get(constructor) ?? {};
            Object.keys(hooks).forEach(key => {
                const accessors = hooks[key] ?? [];
                accessors.forEach(item => {
                    const producer = item(this.model);
                    if (!producer) return;
                    const model: any = this.model;
                    this.bind(producer, model[key]);
                })
            })
            constructor = constructor.__proto__
        }
    }

    public unload() {
        this.router.producers.forEach((list, handler) => {
            [...list].forEach(item => this.unbind(item, handler));
        })
        this.router.consumers.forEach((list, path) => {
            const keys = path.split('/');
            const key = keys.pop();
            if (!key) return;
            const child: Record<string, AgentUtil> = this.model.proxy.child;
            const event: Record<string, EventProducer> | undefined = child[keys.join('/')]?.event
            const producer = event?.[key];
            if (!producer) return;
            [...list].forEach(item => {
                const { model: that, handler } = item;
                if (that.utils.route.root !== this.utils.route.root) return;
                that.utils.event.unbind(producer, handler);
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

