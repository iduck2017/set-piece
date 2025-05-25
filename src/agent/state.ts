import { Model } from "../model";
import { Agent } from "./agent";
import { DeepReadonly, Mutable, Writable } from "utility-types";
import { TranxService } from "../service/tranx";


export class StateAgent<
    M extends Model = Model,
    S1 extends Record<string, any> = {},
    S2 extends Record<string, any> = {},
> extends Agent<M> {

    private _current: Readonly<DeepReadonly<S1 & S2>>
    public get current() {
        return { ...this._current }
    }

    public readonly draft: Mutable<DeepReadonly<S1 & S2>> 
    
    private readonly router: {
        consumers: Map<string, DecorConsumer[]>,
        producers: Map<DecorUpdater, DecorProducer[]>
    }
    
    constructor(target: M, props: Mutable<DeepReadonly<S1 & S2>>) {
        super(target);
        
        this.router = {
            consumers: new Map(),
            producers: new Map()
        }

        this._current = { ...props }
        this.draft = new Proxy({ ...props }, {
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this),
        })
    }

    public update(path: string) {
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;

        if (keys.length) {
            const child: Record<string, Model | Model[]> = this.agent.child.current;
            let value: Model | Model[] | undefined = child[key];
            if (!value) return;
            if (Model.isModel(value)) value = [value];

            const path = keys.join('/');
            for (const model of value) {
                if (!Model.isModel(model)) continue;
                model.agent.state.update(path);
            }
        } else {
            this.emit(key);
        }
    } 


    private set(origin: any, key: string, next: any) {
        origin[key] = next;
        this.update(key);
        return true;
    }
    
    private del(origin: any, key: string) {
        delete origin[key];
        this.update(key);
        return true;
    }

    @TranxService.span()
    public emit(key: string) {
        let state: any = { ...this.draft };
        let value = state[key];

        if (!this.target.agent.route.isLoad) return value;

        let target: Model | undefined = this.target;
        let path: string = key;
        while (target) {
            const router = target.agent.state.router;
            
            const consumers = router.consumers.get(path) ?? [];
            for (const consumer of [ ...consumers ]) {
                const target = consumer.target;
                const updater = consumer.updater;
                value = updater.call(target, this.target, value);
            }
            
            path = target.agent.route.key + '/' + path;
            target = target.agent.route.parent;
        }

        this._current = { ...state, [key]: value };
    }


    public bind<S, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { target, path } = producer;
        const router = target.agent.state.router;

        const consumers = router.consumers.get(path) ?? [];
        consumers.push({ target: this.target, updater });
        router.consumers.set(path, consumers);
        
        const producers = this.router.producers.get(updater) ?? [];
        producers.push(producer);
        this.router.producers.set(updater, producers);

        target.agent.state.update(path);
    }


    public unbind<S, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { target, path } = producer;

        let index;

        const router = target.agent.state.router;
        const comsumers = router.consumers.get(path) ?? [];
        index = comsumers.findIndex(item => (
            item.updater === updater &&
            item.target === this.target
        ));
        if (index !== -1) comsumers.splice(index, 1);

        const producers = this.router.producers.get(updater) ?? [];
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
        
        target.agent.state.update(path);
    }


    public load() {
        let constructor: any = this.target.constructor;
        while (constructor) {
            const registry = StateAgent.registry.get(constructor) ?? {};
            for (const key of Object.keys(registry)) {
                const accessors = registry[key] ?? [];
                for (const accessor of [ ...accessors ]) {
                    const producer = accessor(this.target);
                    if (!producer) continue;
                    const target: any = this.target;
                    this.bind(producer, target[key]);
                }
            }
            constructor = constructor.__proto__;
        }


        const keys: string[] = [];
        
        let target: Model | undefined = this.agent.route.parent;
        let prefix = this.agent.route.key ?? '';
        
        while (target) {
            const consumers = target.agent.state.router.consumers;
            const paths = [...consumers]
                .filter(entry => entry[0].startsWith(prefix))
                .map(entry => entry[0].split('/').pop())
                
            for (const path of paths) {
                if (!path) continue;
                if (keys.includes(path)) continue;
                keys.push(path);
            }
            prefix = target.agent.route.key + '/' + prefix;
            target = target.agent.route.parent;
        }
        
        if (keys.length) console.log('update', keys.join(', '))
        for (const key of keys) this.emit(key);
    }

    public unload() {
        for(const channel of this.router.producers) {
            const [ handler, producers ] = channel;
            for (const producer of [...producers]) {
                this.unbind(producer, handler);
            }
        }
        this._current = this.draft;
    }

    public uninit() {
        for (const channel of this.router.consumers) {
            const [ path, consumers ] = channel;
            const decor: Record<string, DecorProducer> = this.target.proxy.decor;
            const producer: DecorProducer | undefined = decor[path];
            
            if (!producer) continue;
            for (const consumer of [ ...consumers ]) {
                const { target, updater } = consumer;
                target.agent.state.unbind(producer, updater);
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


export type DecorUpdater<S = any, M extends Model = Model> = (target: M, state: S) => S

export type DecorConsumer = { target: Model, updater: DecorUpdater }

export class DecorProducer<S = any, M extends Model = Model> {
    public readonly path: string;

    public readonly target: M;

    constructor(target: M, path: string) {
        this.path = path;
        this.target = target;
    }
}
