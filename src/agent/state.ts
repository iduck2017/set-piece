import { Value } from "@/types";
import { Agent } from ".";
import { Model } from "@/model";
import { DebugService } from "@/service/debug";
import { TranxService } from "@/service/tranx";

export type DecorUpdater<S = any, M extends Model = Model> = (target: M, state: S) => S

export type DecorConsumer = { target: Model, updater: DecorUpdater }

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



@DebugService.is(target => target.target.name + '::state')
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
    
    private readonly _router: {
        consumers: Map<string, DecorConsumer[]>,
        producers: Map<DecorUpdater, DecorProducer[]>
    }
    

    constructor(target: M, props: S1 & S2) {
        super(target);
        
        this._router = {
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
        console.log('update', path);
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;

        if (keys.length) {
            const child: Record<string, Model | Model[]> = this.agent.child.current;
            const value: unknown = child[key];
            if (value instanceof Array) {
                for (const model of value) {
                    if (model instanceof Model) model._agent.state.update(path);
                }
            }
            if (value instanceof Model) value._agent.state.update(path);
        } else {
            this._update(key);
        }
    } 

    @DebugService.log()
    @TranxService.span()
    private _update(key: string) {
        console.log('update', key);
        const next = this.emit(key)
        const current: any = { ...this._current, [key]: next };
        this._current = current;
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
        console.log('emit', key);

        let target: Model | undefined = this.target;
        const prev = this.draft[key];
        if (!this.target._cycle.isLoad) return prev;

        let next = this.draft[key];
        let path = key;
        while (target) {
            const router = target._agent.state._router;
            const consumers = router.consumers.get(path) ?? [];
            for (const consumer of [...consumers]) {
                const target = consumer.target;
                const updater = consumer.updater;
                next = updater.call(target, this.target, next);
            }
            path = target._agent.route.path + '/' + path;
            target = target._agent.route.parent;
        }

        console.log('emit result:', prev, next);
        return next;
    }


    @DebugService.log()
    public bind<E, M extends Model>(
        producer: DecorProducer<E, M>, 
        updater: DecorUpdater<E, M>
    ) {
        console.log('decor:', producer.path);
        const { target, path } = producer;
        const router = target._agent.state._router;

        const consumers = router.consumers.get(path) ?? [];
        consumers.push({ target: this.target, updater });
        router.consumers.set(path, consumers);
        
        const producers = this._router.producers.get(updater) ?? [];
        producers.push(producer);
        this._router.producers.set(updater, producers);

        target._agent.state.update(path);
    }


    @DebugService.log()
    public unbind<S, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        console.log('decor:', producer.path);
        const { target, path } = producer;

        let index;

        const router = target._agent.state._router;
        const comsumers = router.consumers.get(path) ?? [];
        index = comsumers.findIndex(item => (
            item.updater === updater &&
            item.target === this.target
        ));
        if (index !== -1) comsumers.splice(index, 1);

        const producers = this._router.producers.get(updater) ?? [];
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
        
        target._agent.state.update(path);
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
                    const target: any = this.target;
                    this.bind(producer, target[key]);
                }
            }
            constructor = (constructor as any).__proto__;
        }

        const keys: string[] = [];
        
        let target: Model | undefined = this.target;
        let prefix = '';

        while (target) {
            const consumers = target._agent.state._router.consumers;
            const paths = [...consumers]
                .filter(entry => entry[0].startsWith(prefix))
                .map(entry => entry[0].split('/').pop())
                
            for (const path of paths) {
                if (!path) continue;
                if (keys.includes(path)) continue;
                keys.push(path);
            }

            prefix = target._agent.route.path + '/';
            target = target._agent.route.parent;
        }
        console.log('keys', keys)
        
        for (const key of keys) this.emit(key);
    }

    public unload() {
        for(const channel of this._router.producers) {
            const [ handler, producers ] = channel;
            for (const producer of [...producers]) {
                this.unbind(producer, handler);
            }
        }
        this._current = this.draft;
    }

    @DebugService.log()
    public uninit() {
        for (const channel of this._router.consumers) {
            const [ path, consumers ] = channel;
            const decor: Record<string, DecorProducer> = this.target.proxy.decor;
            const producer: DecorProducer = decor[path];
            for (const consumer of [...consumers]) {
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