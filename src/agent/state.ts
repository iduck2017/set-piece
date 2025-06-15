import { Model } from "../model";
import { Agent } from "./agent";
import { TranxService } from "../service/tranx";
import { DecorConsumer, DecorProducer, DecorUpdater } from "../utils/decor";
import { State } from "../types";

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
        let model: Model | undefined = this.model;
        while (model) {
            const router = model.agent.state.router;
            const consumers = router.consumers.get(path) ?? [];
            for (const consumer of [ ...consumers ]) {
                const that = consumer.model;
                const updater = consumer.updater;
                state = updater.call(that, this.model, state);
            }
            path = model.agent.route.key + '/' + path;
            model = model.agent.route.parent;
        }
        this._current = state;
        return true;
    }





    

    public bind<S extends Record<string, any>, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { model: that, path } = producer;

        if (this.agent.route.root !== that.agent.route.root) return;

        const consumers = that.agent.state.router.consumers.get(path) ?? [];
        consumers.push({ model: this.model, updater });
        that.agent.state.router.consumers.set(path, consumers);
        
        const producers = this.router.producers.get(updater) ?? [];
        producers.push(producer);
        this.router.producers.set(updater, producers);

        that.agent.state.update(path);
    }

    
    public unbind<S extends Record<string, any>, M extends Model>(
        producer: DecorProducer<S, M>, 
        updater: DecorUpdater<S, M>
    ) {
        const { model: that, path } = producer;

        let index;
        const comsumers = that.agent.state.router.consumers.get(path) ?? [];
        index = comsumers.findIndex(item => (
            item.updater === updater &&
            item.model === this.model
        ));
        if (index !== -1) comsumers.splice(index, 1);

        const producers = this.router.producers.get(updater) ?? [];
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
        
        that.agent.state.update(path);
    }




    public load() {
        let constructor: any = this.model.constructor;
        while (constructor) {
            const reg = StateAgent.reg.get(constructor) ?? {};
            for (const key of Object.keys(reg)) {
                const accessors = reg[key] ?? [];
                for (const accessor of [ ...accessors ]) {
                    const producer = accessor(this.model);
                    if (!producer) continue;
                    const model: any = this.model;
                    this.bind(producer, model[key]);
                }
            }
            constructor = constructor.__proto__;
        }
        this.emit();
    }

    public unload() {
        for(const channel of this.router.producers) {
            const [ handler, producers ] = channel;
            [ ...producers ].forEach(value => this.unbind(value, handler));
        }
        for (const channel of this.router.consumers) {
            const [ path, consumers ] = channel;
            const keys = path.split('/');
            const key = keys.pop();
            const proxy: any = this.model.proxy;
            const producer = proxy.child[keys.join('/')].decor;
            if (!producer) continue;
            for (const consumer of [ ...consumers ]) {
                const { model: that, updater } = consumer;
                if (that.agent.route.root !== this.agent.route.root) continue;
                that.agent.state.unbind(producer, updater);
            }
        }
        this.emit();
    }


    public debug(): Model[] {
        const dependency: Model[] = [];
        this.router.producers.forEach((value) => {
            dependency.push(...value.map(item => item.model));
        })
        this.router.consumers.forEach((value) => {
            dependency.push(...value.map(item => item.model));
        })
        return dependency;
    }




    private static reg: Map<Function, 
        Record<string, Array<(model: Model) => DecorProducer | undefined>>
    > = new Map();

    public static use<S extends Record<string, any>, M extends Model, I extends Model>(
        accessor: (model: I) => DecorProducer<S, M> | undefined
    ) {
        return function(
            target: I,
            key: string,
            descriptor: TypedPropertyDescriptor<DecorUpdater<S, M>>
        ): TypedPropertyDescriptor<DecorUpdater<S, M>> {
            const reg = StateAgent.reg.get(target.constructor) ?? {};
            if (!reg[key]) reg[key] = [];
            reg[key].push(accessor);
            StateAgent.reg.set(target.constructor, reg);
            return descriptor;
        }
    }

}

