import { Model } from "../model";
import { Util } from ".";
import { TranxUtil } from "./tranx";
import { DecorConsumer, DecorProducer, DecorUpdater } from "../types/decor";
import { State } from "../types/model";
import { DebugUtil, LogLevel } from "./debug";
import { AgentUtil } from "./agent";

@DebugUtil.is(self => `${self.model.name}::state`)
export class StateUtil<
    M extends Model = Model,
    S extends Model.State = Model.State,
> extends Util<M> {

    private static registry: Map<Function, Record<string, Array<(self: Model) => DecorProducer | undefined>>> = new Map();

    public static on<S extends Record<string, any>, M extends Model, I extends Model>(
        accessor: (self: I) => DecorProducer<S, M> | undefined
    ) {
        return function(
            prototype: I,
            key: string,
            descriptor: TypedPropertyDescriptor<DecorUpdater<S, M>>
        ): TypedPropertyDescriptor<DecorUpdater<S, M>> {
            const hooks = StateUtil.registry.get(prototype.constructor) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(accessor);
            StateUtil.registry.set(prototype.constructor, hooks);
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
            const child: Record<string, Model | Model[]> = this.utils.child.current;
            if (child[key] instanceof Array) child[key].forEach(item => item.utils.state.update(path))
            if (child[key] instanceof Model) child[key].utils.state.update(path);
        } 
        else this.reset();
    } 

    @TranxUtil.span()
    private reset() {}

    @TranxUtil.span()
    private set(origin: any, key: string, next: any) {
        origin[key] = next;
        return true
    }
    
    @TranxUtil.span()
    private del(origin: any, key: string) {
        delete origin[key];
        return true;
    }

    @DebugUtil.log(LogLevel.DEBUG)
    public emit() {
        let path: string = 'decor';
        let state: any = { ...this.draft };
        let parent: Model | undefined = this.model;
        const consumers: DecorConsumer[] = [];
        while (parent) {
            const router = parent.utils.state.router;
            consumers.push(...router.consumers.get(path) ?? []);
            path = parent.utils.route.key + '/' + path;
            parent = parent.utils.route.parent;
        }
        consumers.sort((a, b) => a.model.uuid.localeCompare(b.model.uuid));
        consumers.forEach(item => state = item.updater.call(item.model, this.model, state));
        this._current = state;
    }

    public bind<S extends Record<string, any>, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { model: that, path } = producer;
        if (this.utils.route.root !== that.utils.route.root) return;
        const consumers = that.utils.state.router.consumers.get(path) ?? [];
        const producers = this.router.producers.get(updater) ?? [];
        consumers.push({ model: this.model, updater });
        producers.push(producer);
        that.utils.state.router.consumers.set(path, consumers);
        this.router.producers.set(updater, producers);
        that.utils.state.update(path);
    }
    
    public unbind<S extends Record<string, any>, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { model: that, path } = producer;
        const comsumers = that.utils.state.router.consumers.get(path) ?? [];
        const producers = this.router.producers.get(updater) ?? [];
        let index = comsumers.findIndex(item => item.updater === updater && item.model === this.model);
        if (index !== -1) comsumers.splice(index, 1);
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
        that.utils.state.update(path);
    }

    public load() {
        let constructor: any = this.model.constructor;
        while (constructor) {
            const hooks = StateUtil.registry.get(constructor) ?? {};
            Object.keys(hooks).forEach(key => {
                const accessors = hooks[key] ?? [];
                [...accessors].forEach(item => {
                    const producer = item(this.model);
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
        this.router.producers.forEach((list, handler) => {
            [...list].forEach(item => this.unbind(item, handler));
        });
        this.router.consumers.forEach((list, path) => {
            const keys = path.split('/');
            keys.pop();
            const child: Record<string, AgentUtil> = this.model.proxy.child;
            const producer = child[keys.join('/')]?.decor;
            if (!producer) return;
            [...list].forEach(item => {
                const { model: that, updater } = item;
                if (that.utils.route.root !== this.utils.route.root) return;
                that.utils.state.unbind(producer, updater);
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

