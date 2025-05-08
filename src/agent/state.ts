import { Value } from "@/types";
import { Agent } from ".";
import { Model } from "@/model";
import { DebugService } from "@/service/debug";
import { DecorConsumer, DecorUpdater } from "@/types/decor";
import { ModelProxy } from "@/utils/proxy";

export class DecorProducer<S = any, M extends Model = Model> {
    public readonly path: string;

    public readonly target: M;

    constructor(target: M, path: string) {
        this.target = target;
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
    
    private readonly router: Map<string, DecorConsumer[]>
    
    private readonly routerInvert: Map<DecorUpdater, DecorProducer[]>
    

    constructor(target: M, props: S1 & S2) {
        super(target);
        
        this.router = new Map();
        this.routerInvert = new Map();

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
                    model.agent.state.update(path);
                }
            } else {
                const child: any = this.agent.child.current;
                const model: unknown = child[key];
                if (model instanceof Model) model.agent.state.update(path)
            }
        } else {
            const current: any = { ...this._current, [key]: this.emit(key) };
            this._current = current;
        }
    } 


    @DebugService.log()
    private set(origin: any, key: string, value: any) {
        origin[key] = value;
        this.update(key);
        return true;
    }
    
    @DebugService.log()
    private delete(origin: any, key: string) {
        delete origin[key]
        this.update(key)
        return true;
    }


    @DebugService.log()
    public emit(key: string) {
        let target: Model | undefined = this.target;
        let result = Reflect.get(this.draft, key);
        let path = key;
        while (target) {
            const router = target.agent.state.router;
            const consumers = router.get(path) ?? [];
            for (const consumer of consumers) {
                const target = consumer.target;
                const updater = consumer.updater;
                result = updater.call(target, this.target, result);
            }
            path = target.path + '/' + path;
            target = target.parent;
        }
        return result;
    }


    @DebugService.log()
    protected bind<E, M extends Model>(
        producer: DecorProducer<E, M>, 
        updater: DecorUpdater<E, M>
    ) {
        const { target, path } = producer;
        const router = target.agent.state.router;

        const consumers = router.get(path) ?? [];
        consumers.push({ target: this.target, updater });
        router.set(path, consumers);

        const producers = this.routerInvert.get(updater) ?? [];
        producers.push(producer);
        this.routerInvert.set(updater, producers);
        
        target.agent.state.update(path);
    }



    @DebugService.log()
    protected unbind<S, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { target, path } = producer;
        const router = target.agent.state.router;

        let comsumers = router.get(path) ?? [];
        comsumers = comsumers.filter(item => {
            if (item.updater !== updater) return true;
            if (item.target !== this.target) return true;
            return false;
        });
        router.set(path, comsumers);

        let producers = this.routerInvert.get(updater) ?? [];
        producers = producers.filter(item => item !== producer);
        this.routerInvert.set(updater, producers);
        
        target.agent.state.update(path)
    }


    @DebugService.log()
    public load() {
        let constructor = this.target.constructor;
        const target = this.target;
        while (constructor) {
            const registry = StateAgent.registry.get(constructor) ?? {};
            for (const key of Object.keys(registry)) {
                const accessors = registry[key];
                for (const accessor of accessors) {
                    const producer = accessor(target.proxy);
                    if (!producer) continue;
                    const handler: any = Reflect.get(target, key)
                    this.bind(producer, handler);
                }
            }
            constructor = (constructor as any).__proto__;
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
            const producer: DecorProducer = Reflect.get(proxy.decor, path);
            for (const consumer of consumers) {
                const { target, updater } = consumer;
                target.agent.state.unbind(producer, updater);
            }
        }
    }


    private static registry: Map<Function, Record<string, Array<(proxy: ModelProxy) => DecorProducer | undefined>>> = new Map();

    @DebugService.log()
    public static use<S, M extends Model, I extends Model>(
        accessor: (model: Model.Proxy<I>) => DecorProducer<S, M> | undefined
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