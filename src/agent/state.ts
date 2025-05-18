import { Value } from "@/types";
import { Agent } from ".";
import { Model } from "@/model";
import { DebugService } from "@/service/debug";
import { DecorConsumer, DecorUpdater } from "@/types/decor";
import { TranxService } from "@/service/tranx";
import { ModelStatus } from "@/utils/cycle";

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

@DebugService.is(target => target.target.name)
export class StateAgent<
    S1 extends Record<string, Value> = Record<string, Value>,
    S2 extends Record<string, Value> = Record<string, Value>,
    M extends Model = Model
> extends Agent<M> {

    private _current: Readonly<S1 & S2>
    public get current(): Readonly<S1 & S2> {
        if (this.target._cycle.status !== ModelStatus.LOAD) return { ...this.draft };
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
        console.log('update', path);
        const keys = path.split('/');
        const key = keys.shift();
        if (!key) return;

        if (keys.length) {
            if (key === String(0)) {
                const path = keys.join('/');
                const models = [ ...this.agent.child.current ];
                for (const model of models) {
                    model?._agent.state.update(path);
                }
            } else {
                const child: any = this.agent.child.current;
                const model: unknown = child[key];
                if (model instanceof Model) model._agent.state.update(path)
            }
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
            console.log('decor', path);
            const router = target._agent.state.router;
            const consumers = router.consumers.get(path) ?? [];
            for (const consumer of [...consumers]) {
                const target = consumer.target;
                const updater = consumer.updater;
                console.log('updater', updater)
                next = updater.call(target, this.target, next);
            }
            path = target._agent.route.current.path + '/' + path;
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
        console.log('decor:', producer.path);
        const { target, path } = producer;
        const router = target._agent.state.router;

        const consumers = router.consumers.get(path) ?? [];
        consumers.push({ target: this.target, updater });
        router.consumers.set(path, consumers);
        
        const producers = this.router.producers.get(updater) ?? [];
        producers.push(producer);
        this.router.producers.set(updater, producers);

        const keys = path.split('/');
        let prev: (Model | undefined)[] = [target];
        const key = keys.pop();
        while (keys.length) {
            const key = keys.pop();
            if (!key) break;
            let next: (Model | undefined)[] = [];
            for (const model of prev) {
                if (key === String(0)) next.push(...model?._agent.child.current ?? []);
                else if (model?._agent.child.current) next.push(Reflect.get(model._agent.child.current, key));
            }
            prev = next;
        }
        if (key) prev.map(model => model?._agent.state.update(key));
    }


    @DebugService.log()
    public unbind<S, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        console.log('decor:', producer.path);
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
        
        const keys = path.split('/');
        let prev: (Model | undefined)[] = [target];
        const key = keys.pop();
        while (keys.length) {
            const key = keys.pop();
            if (!key) break;
            let next: (Model | undefined)[] = [];
            for (const model of prev) {
                if (key === String(0)) next.push(...model?._agent.child.current ?? []);
                else if (model?._agent.child.current) next.push(Reflect.get(model._agent.child.current, key));
            }
            prev = next;
        }

        if (!key) return;
        prev.map(model => model?._agent.state.update(key));
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

        const keys: string[] = [];
        let target: Model | undefined = this.target;
        let prefix = '';
        while (target) {
            console.log('target', target, prefix)
            const paths = [...target._agent.state.router.consumers]
                .map(entry => entry[0])
                .filter(path => path.startsWith(prefix))
                .map(path => path.split('/').pop() ?? '')
                .filter(Boolean)
                
            for (const path of paths) {
                if (keys.includes(path)) continue;
                keys.push(path);
            }
            prefix = target.path + '/';
            target = target.parent;
        }
        console.log('keys', keys)
        
        for (const key of keys) {
            this.emit(key);
        }
    }

    public unload() {
        for(const channel of this.router.producers) {
            const [ handler, producers ] = channel;
            for (const producer of [...producers]) {
                this.unbind(producer, handler);
            }
        }
    }

    @DebugService.log()
    public uninit() {
        for (const channel of this.router.consumers) {
            const [ path, consumers ] = channel;
            const proxy = this.target.proxy;
            const producer: DecorProducer = Reflect.get(proxy.decor, path);
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