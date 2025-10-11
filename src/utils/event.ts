import { Frame, Model } from "../model"
import { Util } from ".";
import { IClass, Method } from "../types";
import { DeepReadonly } from "utility-types";

export type Emitter<E = any> = (event: E) => any
export type Handler<E = any, M extends Model = any> = (that: M, event: E) => any

export type Consumer = Readonly<{ model: Model, handler: Handler }>
export type Producer<E = any, M extends Model = Model> = Readonly<{
    model: M;
    name: string;
    path?: string;
    type?: IClass<Model>;
    _never?: E;
}>

export class Event<E extends Record<string, any> = {}> {
    protected _detail: E;
    public get detail(): Readonly<E> { return { ...this._detail }}

    constructor(event: E) {
        this._detail = event;
    }
}

export class EventUtil<M extends Model, E extends Model.E> extends Util<M> {
    
    // static
    private static registry: {
        checker: Map<Function, string[]>
        handler: Map<Function, Record<string, Array<Method<Handler>>>>,
    } = {
        handler: new Map(),
        checker: new Map()
    };


    public static on<E, I extends Model, M extends Model>(
        handler: (self: I) => Handler<E, M>
    ) {
        return function(
            prototype: I,
            key: string,
            descriptor: TypedPropertyDescriptor<() => Producer<E, M> | undefined>
        ): TypedPropertyDescriptor<() => Producer<E, M> | undefined> {
            const type = prototype.constructor;
            const hooks = EventUtil.registry.handler.get(type) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(handler);
            EventUtil.registry.handler.set(type, hooks);
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
            const hooks = EventUtil.registry.checker.get(type) ?? []
            hooks.push(key);
            EventUtil.registry.checker.set(type, hooks);
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
        let path: string | undefined = undefined;
        let parent: Model | undefined = this.model;
        const consumers: Consumer[] = [];
        while (parent) {
            const router = parent.utils.event.router;
            router.consumers.forEach((list, producer) => {
                if (producer.name !== name) return;
                if (producer.type) {
                    if (!(this.model instanceof producer.type)) return;
                    if (!(path ?? '').startsWith(producer.path ?? '')) return;
                } else if (path !== producer.path) return;
                consumers.push(...list);
            })
            if (path) path = parent.utils.route.key + '/' + path;
            else path = parent.utils.route.key;
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
        const { model: that, path, name } = producer;
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
        const { model: that, path } = producer;
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
        // check
        let constructor: any = this.model.constructor;
        while (constructor) {
            const keys = EventUtil.registry.checker.get(constructor) ?? [];
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
            const registry = EventUtil.registry.handler.get(constructor) ?? {};
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
        this.router.producers.forEach((list, handler) => {
            [...list].forEach(item => this.unbind(item, handler));
        })

        // consumers
        this.router.consumers.forEach((list, producer) => {
            [...list].forEach(item => {
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