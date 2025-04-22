import { Callback, Value } from "@/types";
import { Agent } from ".";
import { Model } from "@/model";
import { TrxContext } from "@/context/trx";
import { DebugContext } from "@/context/debug";
import { DecorConsumer, DecorProducer, DecorProducers, DecorUpdater } from "@/types/decor";

type ProducerAccessor = Callback<DecorProducer | undefined, [Model]>

export class StateAgent<
    S1 extends Record<string, Value> = Record<string, Value>,
    S2 extends Record<string, Value> = Record<string, Value>,
    M extends Model = Model
> extends Agent<M> {
    public current: Readonly<S1 & S2>
    
    public currentOrigin: Readonly<S1 & S2>
    
    private history?: Model.State<M>
    
    public workspace: S1 & S2
    
    public proxy: S1 & S2
    
    private altered: string[];

    public readonly producers: Readonly<DecorProducers<S1, M>>;
    
    private readonly router: Map<string, DecorConsumer[]>
    
    private readonly routerInvert: Map<DecorUpdater, DecorProducer[]>

    constructor(target: M, props: S1 & S2) {
        super(target);
        this.altered = [];
        this.workspace = { ...props }
        this.currentOrigin = { ...props }
        this.current = { ...props }
        this.proxy = new Proxy({} as any, {
            get: this.getState.bind(this),
            set: this.set.bind(this),
            deleteProperty: this.delete.bind(this),
        })
        this.router = new Map();
        this.routerInvert = new Map();
        this.producers = new Proxy({} as any, {
            get: this.getDecor.bind(this)
        })
    }
    
    @TrxContext.use()
    @DebugContext.log()
    public setBatch(
        handler: Callback<Partial<S1 & S2>, [S1 & S2]>
    ) {
        const statePrev: S1 & S2 = { ...this.current };
        const nextPrev = handler(statePrev);
        this.workspace = { ...this.workspace, ...nextPrev }
    }
    
    @DebugContext.log()
    public check(path: string) {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;
        if (keys.length) {
            if (key === '0') {
                const path = keys.join('/');
                const childAgent = this.agent.child;
                const models = [ ...childAgent.current ];
                for (const model of models) {
                    const stateAgent = model.agent.state;
                    stateAgent.check(path);
                }
            } else {
                const childAgent = this.agent.child;
                const model: Model = Reflect.get(childAgent.current, key)
                const stateAgent = model.agent.state;
                stateAgent.check(path)
            }
        } else {
            if (this.altered.includes(key)) return;
            this.altered.push(key);
        }
    } 

    private getDecor(origin: never, path: string) { 
        const DecoyAgent = this.target.agent.decoy;
        return Reflect.get(DecoyAgent.decor, path)
    }

    private getState(origin: never, key: string) {
        return this.currentOrigin[key];
    }

    @TrxContext.use()
    @DebugContext.log()
    private set(origin: never, key: string, value: any) {
        Reflect.set(this.workspace, key, value); 
        this.check(key);
        return true;
    }
    
    @TrxContext.use()
    @DebugContext.log()
    private delete(origin: never, key: string) {
        Reflect.deleteProperty(this.workspace, key); 
        this.check(key)
        return true;
    }

    @DebugContext.log()
    public commit() {
        if (!this.altered.length) return;
        const current = { ...this.current };
        for (const key of this.altered) {
            const value = this.emit(key);
            Reflect.set(current, key, value);
        }
        this.history = this.target.state;
        this.currentOrigin = { ...this.workspace };
        this.current = current;
    }

    @DebugContext.log()
    public emit(key: string) {
        let target: Model | undefined = this.target;
        let result = Reflect.get(this.workspace, key);
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

    @DebugContext.log()
    protected bind<E, M extends Model>(
        producer: DecorProducer<E, M>, 
        updater: DecorUpdater<E, M>
    ) {
        const { target, path } = producer;
        const stateAgent = target.agent.state;
        const router = stateAgent.router;
        const consumers = router.get(path) ?? [];
        consumers.push({ target: this.target, updater });
        router.set(path, consumers);

        const producers = this.routerInvert.get(updater) ?? [];
        producers.push(producer);
        this.routerInvert.set(updater, producers);
        
        stateAgent.check(path);
    }

    @DebugContext.log()
    protected unbind<S, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { target, path } = producer;
        const stateAgent = target.agent.state;

        const router = stateAgent.router;
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
        
        stateAgent.check(path)
    }

    @DebugContext.log()
    public load() {
        let constructor = this.target.constructor;
        const target = this.target;
        while (constructor) {
            const registry = StateAgent.registry.get(constructor) ?? {};
            for (const key of Object.keys(registry)) {
                const accessors = registry[key];
                for (const accessor of accessors) {
                    const producer = accessor(target);
                    if (!producer) continue;
                    const handler: any = Reflect.get(target, key)
                    this.bind(producer, handler);
                }
            }
            constructor = Reflect.get(constructor, '__proto__');
        }
        this.commit();
    }

    @DebugContext.log()
    public unload() {
        for (const channel of this.router) {
            const [ path, consumers ] = channel;
            const producer: DecorProducer = Reflect.get(this.producers, path);
            for (const consumer of consumers) {
                const { target, updater } = consumer;
                const stateAgent = target.agent.state;
                stateAgent.unbind(producer, updater);
            }
        }
        this.agent.state.commit()
    }

    @DebugContext.log()
    public destroy() {
        for (const channel of this.routerInvert) {
            const [ handler, producers ] = channel
            for (const producer of producers) {
                this.unbind(producer, handler);
            }
        }
    }

    private static registry: Map<Function, Record<string, ProducerAccessor[]>> = new Map();

    @DebugContext.log()
    public static use<S, M extends Model>(accessor: (model: M) => DecorProducer<S, M> | undefined) {
        return function(
            target: M,
            key: string,
            descriptor: TypedPropertyDescriptor<DecorUpdater<S, M>>
        ): TypedPropertyDescriptor<DecorUpdater<S, M>> {
            const registry = StateAgent.registry.get(target.constructor) ?? {};
            if (!registry[key]) registry[key] = [];
            registry[key].push(accessor);
            StateAgent.registry.set(target.constructor, registry);
            return descriptor;
        };
    }

    @DebugContext.log()
    public reset() {
        if (!this.history) return;
        this.agent.event.emit('onStateUpdate', {
            prev: this.history,
            next: this.current
        })
        this.history = undefined;
        this.altered = [];
    }
}