import { Model } from "../model";
import { Util } from ".";
import { DebugUtil, LogLevel } from "./debug";
import { Event, Consumer, Emitter, Handler, Producer } from "../types/event";
import { Frame, Props } from "../types/model";
import { IType, Method } from "../types";

@DebugUtil.is(self => `${self.model.name}::event`)
export class EventUtil<
    M extends Model = Model,
    E extends Props.E = Props.E,
> extends Util<M> {
    private static registry: {
        accessor: Map<Function, Record<string, Array<Method<Producer | undefined, [Model]>>>>,
        validator: Map<Function, Method<any, [Model]>>
    } = {
        accessor: new Map(),
        validator: new Map()
    };

    // @todo self => memory
    public static if<M extends Model>(validator: (self: M) => any) {
        return function(type: IType<M>) {
            EventUtil.registry.validator.set(type, validator);
        }
    }

    public static on<
        E extends Event, 
        M extends Model, 
        I extends Model
    >(accessor: (self: I) => Producer<E, M> | undefined) {
        return function(
            prototype: I,
            key: string,
            descriptor: TypedPropertyDescriptor<Handler<E, M>>
        ): TypedPropertyDescriptor<Handler<E, M>> {
            const hooks = EventUtil.registry.accessor.get(prototype.constructor) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(accessor);
            EventUtil.registry.accessor.set(prototype.constructor, hooks);
            return descriptor;
        };
    }

    public readonly current: Readonly<{ [K in keyof E]: Emitter<E[K]> } & { onChange: Emitter<Event<Frame<M>>> }>;
    
    private readonly router: Readonly<{
        consumers: Map<Producer, Consumer[]>,
        producers: Map<Handler, Producer[]>
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
    public emit<E extends Event>(name: string, event: E): void {
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

    public bind<E extends Event, M extends Model>(
        producer: Producer<E, M>, 
        handler: Handler<E, M>
    ) {
        const { model: that, path, name } = producer;
        if (!this.utils.route.check(that)) return;
        const consumers = that.utils.event.router.consumers.get(producer) ?? [];
        const producers = this.router.producers.get(handler) ?? [];
        consumers.push({ model: this.model, handler });
        producers.push(producer);
        that.utils.event.router.consumers.set(producer, consumers);
        this.router.producers.set(handler, producers);
    }

    public unbind<E extends Event, M extends Model>(
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
        let constructor: any = this.model.constructor;
        while (constructor) {
            const validator = EventUtil.registry.validator.get(constructor);
            if (validator && !validator(this.model)) return
            constructor = constructor.__proto__;
        }
        constructor = this.model.constructor;
        while (constructor) {
            const hooks = EventUtil.registry.accessor.get(constructor) ?? {};
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
        this.router.consumers.forEach((list, producer) => {
            [...list].forEach(item => {
                const { model: that, handler } = item;
                if (this.utils.route.check(that)) return;
                that.utils.event.unbind(producer, handler);
            })
        })
    }

    public reload() {
        this.unload();
        this.load();
    }

    public debug() {
        const dependency: string[] = [];
        this.router.producers.forEach(item => dependency.push(...item.map(item => item.model.name)))
        this.router.consumers.forEach(item => dependency.push(...item.map(item => item.model.name)))
        console.log('🔍 dependency', dependency);
    }

}

