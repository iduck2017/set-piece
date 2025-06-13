import { Model } from "../model";
import { Agent } from "./agent";
import { TranxService } from "../service/tranx";
import { DeepReadonly, Primitive } from "utility-types";

export type DecorUpdater<S = any, M extends Model = Model> = (target: M, state: DeepReadonly<S>) => DeepReadonly<S>

export type DecorConsumer = { target: Model, updater: DecorUpdater }

export class DecorProducer<S = any, M extends Model = Model> {
    public readonly path: string;

    public readonly target: M;

    constructor(target: M, path?: string) {
        this.path = path ? path + '/decor' : 'decor';
        this.target = target;
    }
}


export type State<S> = { [K in keyof S]: S[K] extends Primitive ? S[K] : DeepReadonly<S[K]> }

export class StateAgent<
    M extends Model = Model,
    S extends Model.State = Model.State,
> extends Agent<M> {

    public readonly draft: State<S>
    
    private readonly router: {
        consumers: Map<string, DecorConsumer[]>,
        producers: Map<DecorUpdater, DecorProducer[]>
    }

    private _current: S

    public get current() { return { ...this._current } }
    


    
    constructor(target: M, props: S) {
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
        path = keys.join('/');

        if (!key) return;
        if (keys.length) {
            const child: Record<string, Model | Model[]> = this.agent.child.current;

            let value: Model | Model[] | undefined = child[key];
            if (value instanceof Array) {
                value.forEach(value => {
                    value.agent.state.update(path);
                })
            } else if (value) {
                value.agent.state.update(path);
            }

        } else this.emit();
    } 

    
    @TranxService.use()
    private set(origin: any, key: string, next: any) {
        origin[key] = next;
        return this.emit();
    }

    
    @TranxService.use()
    private del(origin: any, key: string) {
        delete origin[key];
        return this.emit();
    }

    
    @TranxService.use()
    public emit() {
        let path: string = 'decor';
        let state: any = { ...this.draft };
        let target: Model | undefined = this.target;
        while (target) {
            const router = target.agent.state.router;
            const consumers = router.consumers.get(path) ?? [];
            for (const consumer of [ ...consumers ]) {
                const target = consumer.target;
                const updater = consumer.updater;
                state = updater.call(target, this.target, state);
            }
            path = target.agent.route.key + '/' + path;
            target = target.agent.route.parent;
        }
        this._current = state;
        return true;
    }





    

    public bind<S, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { target, path } = producer;

        if (this.target.agent.route.root !== target.agent.route.root) return;

        const consumers = target.agent.state.router.consumers.get(path) ?? [];
        consumers.push({ target: this.target, updater });
        target.agent.state.router.consumers.set(path, consumers);
        
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
        const comsumers = target.agent.state.router.consumers.get(path) ?? [];
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
        this.emit();
    }

    public unload() {
        for(const channel of this.router.producers) {
            const [ handler, producers ] = channel;
            for (const producer of [ ...producers ]) {
                this.unbind(producer, handler);
            }
        }
        for (const channel of this.router.consumers) {
            const [ path, consumers ] = channel;
            const keys = path.split('/');
            const key = keys.pop();
            const proxy: any = this.target.proxy;
            const producer = proxy.child[keys.join('/')].decor;
            if (!producer) continue;
            for (const consumer of [ ...consumers ]) {
                const { target, updater } = consumer;
                if (target.agent.route.root !== this.target.agent.route.root) continue;
                target.agent.state.unbind(producer, updater);
            }
        }
        this.emit();
    }


    public debug(): Model[] {
        const dependency: Model[] = [];
        this.router.producers.forEach((value) => {
            dependency.push(...value.map(item => item.target));
        })
        this.router.consumers.forEach((value) => {
            dependency.push(...value.map(item => item.target));
        })
        return dependency;
    }




    private static registry: Map<Function, 
        Record<string, Array<(model: Model) => DecorProducer | undefined>>
    > = new Map();

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

