import { Model } from "../model";
import { Agent } from "./agent";
import { TranxService } from "../service/tranx";
import { DecorConsumer, DecorProducer, DecorUpdater } from "../utils/decor";
import { State } from "../types";
import { DebugService } from "../service/debug";

@DebugService.is(self => `${self.model.name}::state`)
export class StateAgent<
    M extends Model = Model,
    S extends Model.State = Model.State,
> extends Agent<M> {

    private static registry: Map<Function, Record<string, Array<(self: Model) => DecorProducer | undefined>>> = new Map();

    public static use<S extends Record<string, any>, M extends Model, I extends Model>(
        accessor: (self: I) => DecorProducer<S, M> | undefined
    ) {
        return function(
            prototype: I,
            key: string,
            descriptor: TypedPropertyDescriptor<DecorUpdater<S, M>>
        ): TypedPropertyDescriptor<DecorUpdater<S, M>> {
            const hooks = StateAgent.registry.get(prototype.constructor) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(accessor);
            StateAgent.registry.set(prototype.constructor, hooks);
            return descriptor;
        }
    }

    public readonly draft: State<S>
    
    private readonly router: {
        consumers: Map<string, DecorConsumer[]>,
        producers: Map<DecorUpdater, DecorProducer[]>
    }

    private _current: S
    public get current() { return { ...this._current } }
    
    constructor(model: M, props: S) {
        super(model);
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
            if (child[key] instanceof Array) child[key].forEach(item => item.agent.state.update(path))
            if (child[key] instanceof Model) child[key].agent.state.update(path);
        } 
        else this.reset();
    } 

    @TranxService.use()
    private reset() {}

    @TranxService.use()
    private set(origin: any, key: string, next: any) {
        origin[key] = next;
        return true
    }
    
    @TranxService.use()
    private del(origin: any, key: string) {
        delete origin[key];
        return true;
    }

    @DebugService.log('gray')
    public emit() {
        let path: string = 'decor';
        let state: any = { ...this.draft };
        let parent: Model | undefined = this.model;
        while (parent) {
            const router = parent.agent.state.router;
            const consumers = router.consumers.get(path) ?? [];
            [...consumers].forEach(consumer => {
                const that = consumer.model;
                const updater = consumer.updater;
                state = updater.call(that, this.model, state);
            });
            path = parent.agent.route.key + '/' + path;
            parent = parent.agent.route.parent;
        }
        this._current = state;
    }

    public bind<S extends Record<string, any>, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { model: that, path } = producer;
        if (this.agent.route.root !== that.agent.route.root) return;
        const consumers = that.agent.state.router.consumers.get(path) ?? [];
        const producers = this.router.producers.get(updater) ?? [];
        consumers.push({ model: this.model, updater });
        producers.push(producer);
        that.agent.state.router.consumers.set(path, consumers);
        this.router.producers.set(updater, producers);
        that.agent.state.update(path);
    }
    
    public unbind<S extends Record<string, any>, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { model: that, path } = producer;
        const comsumers = that.agent.state.router.consumers.get(path) ?? [];
        const producers = this.router.producers.get(updater) ?? [];
        let index = comsumers.findIndex(item => item.updater === updater && item.model === this.model);
        if (index !== -1) comsumers.splice(index, 1);
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
        that.agent.state.update(path);
    }

    public load() {
        let constructor: any = this.model.constructor;
        while (constructor) {
            const hooks = StateAgent.registry.get(constructor) ?? {};
            Object.keys(hooks).forEach(key => {
                const accessors = hooks[key] ?? [];
                [...accessors].forEach(accessor => {
                    const producer = accessor(this.model);
                    if (!producer) return;
                    const model: any = this.model;
                    this.bind(producer, model[key]);
                })
            })
            constructor = constructor.__proto__;
        }
        this.reset();
    }

    public unload() {
        this.router.producers.forEach((producers, handler) => {
            [...producers].forEach(item => this.unbind(item, handler));
        });
        this.router.consumers.forEach((consumers, path) => {
            const keys = path.split('/');
            keys.pop();
            const proxy: any = this.model.proxy;
            const producer = proxy.child[keys.join('/')].decor;
            if (!producer) return;
            [ ...consumers ].forEach(item => {
                const { model: that, updater } = item;
                if (that.agent.route.root !== this.agent.route.root) return;
                that.agent.state.unbind(producer, updater);
            });
        });
        this.reset();
    }


    public debug(): Model[] {
        const dependency: Model[] = [];
        this.router.producers.forEach(item => dependency.push(...item.map(item => item.model)))
        this.router.consumers.forEach(item => dependency.push(...item.map(item => item.model)))
        return dependency;
    }


}

