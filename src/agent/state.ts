import { Value } from "@/types";
import { Agent } from ".";
import { Model } from "@/model";
import { DebugService } from "@/service/debug";
import { DecorConsumer, DecorUpdater } from "@/types/decor";
import { ModelProxy } from "@/utils/proxy";

export class DecorProducer<S = any, M extends Model = Model> {
    public readonly path: string;

    public readonly type: 'decor';

    public readonly target: M;

    constructor(target: M, path: string) {
        this.target = target;
        this.type = 'decor';
        this.path = path;
    }
}

export class StateAgent<
    S1 extends Record<string, Value> = Record<string, Value>,
    S2 extends Record<string, Value> = Record<string, Value>,
    M extends Model = Model
> extends Agent<M> {

    private _current: Readonly<S1 & S2>
    public get current(): Readonly<S1 & S2> {
        return { ...this._current }
    }
    
    public readonly draft: S1 & S2
    
    private readonly router: {
        consumers: Map<string, DecorConsumer[]>,
        producers: Map<DecorUpdater, DecorProducer[]>
    }
    

    constructor(target: M, props: S1 & S2) {
        super(target);
        
        this.router = {
            consumers: new Map(),
            producers: new Map()
        }

        this._current = { ...props }
        this.draft = new Proxy({ ...props }, {
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this),
        })
    }

    @DebugService.log()
    public update(path: string) {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;

        if (keys.length) {
            if (key === String(0)) {
                const path = keys.join('/');
                const models = [ ...this.agent.child.current ];
                for (const model of models) {
                    model._agent.state.update(path);
                }
            } else {
                const child: any = this.agent.child.current;
                const model: unknown = child[key];
                if (model instanceof Model) model._agent.state.update(path)
            }
        } else {
            console.log('update:', this.target.constructor.name, key);
            const current: any = { ...this._current, [key]: this.emit(key) };
            this._current = current;
        }
    } 


    private set(origin: any, key: string, value: any) {
        origin[key] = value;
        this.update(key);
        return true;
    }
    
    private delete(origin: any, key: string) {
        delete origin[key]
        this.update(key)
        return true;
    }


    @DebugService.log()
    public emit(key: string) {
        console.log('emit:', this.target.constructor.name, key);
        let target: Model | undefined = this.target;
        const prev = this.draft[key];
        let next = this.draft[key];
        let path = key;
        while (target) {
            const router = target._agent.state.router;
            const consumers = router.consumers.get(path) ?? [];
            for (const consumer of consumers) {
                const target = consumer.target;
                const updater = consumer.updater;
                next = updater.call(target, this.target, next);
            }
            path = target.path + '/' + path;
            target = target.parent;
        }
        console.log('emit result:', prev, next);
        return next;
    }


    @DebugService.log()
    public bind<E, M extends Model>(
        producer: DecorProducer<E, M>, 
        updater: DecorUpdater<E, M>
    ) {
        console.log('bind:', producer.target.constructor.name);
        const { target, path } = producer;
        const router = target._agent.state.router;

        const consumers = router.consumers.get(path) ?? [];
        consumers.push({ target: this.target, updater });
        router.consumers.set(path, consumers);
        
        const producers = this.router.producers.get(updater) ?? [];
        producers.push(producer);
        this.router.producers.set(updater, producers);

        target._agent.state.update(path);
    }



    @DebugService.log()
    public unbind<S, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        console.log(
            'unbind:', 
            producer.path,
            producer.target.constructor.name,
            this.target.constructor.name
        );
        const { target, path } = producer;

        let index;

        const router = target._agent.state.router;
        const comsumers = router.consumers.get(path) ?? [];
        index = comsumers.findIndex(item => (
            item.updater === updater &&
            item.target === this.target
        ));
        if (index !== -1) comsumers.splice(index, 1);

        const producers = this.router.producers.get(updater) ?? [];
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
        
        target._agent.state.update(path)
    }


    public load() {
        let constructor = this.target.constructor;
        while (constructor) {
            const registry = StateAgent.registry.get(constructor) ?? {};
            for (const key of Object.keys(registry)) {
                const accessors = registry[key];
                for (const accessor of accessors) {
                    const producer = accessor(this.target);
                    if (!producer) continue;
                    const handler: any = Reflect.get(this.target, key)
                    this.bind(producer, handler);
                }
            }
            constructor = (constructor as any).__proto__;
        }
    }

    public unload() {
        console.log('unload decor', this.target.constructor.name);
        for(const channel of this.router.producers) {
            const [ handler, producers ] = channel;
            for (const producer of producers) {
                this.unbind(producer, handler);
            }
        }
    }

    public uninit() {
        for (const channel of this.router.consumers) {
            const [ path, consumers ] = channel;
            const proxy = this.target.proxy;
            const producer: DecorProducer = Reflect.get(proxy.decor, path);
            for (const consumer of consumers) {
                const { target, updater } = consumer;
                target._agent.state.unbind(producer, updater);
            }
        }
    }


    private static registry: Map<Function, Record<string, Array<(model: Model) => DecorProducer | undefined>>> = new Map();

    public static use<S, M extends Model, I extends Model>(
        accessor: (model: I) => DecorProducer<S, M> | undefined
    ) {
        return function(
            target: I,
            key: string,
            descriptor: TypedPropertyDescriptor<DecorUpdater<S, M>>
        ): TypedPropertyDescriptor<DecorUpdater<S, M>> {
            const registry = StateAgent.registry.get(target.constructor) ?? {};
            if (!registry[key]) registry[key] = [];
            registry[key].push(accessor);
            StateAgent.registry.set(target.constructor, registry);
            return descriptor;
        }
    }

}