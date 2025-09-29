import { Model } from "../model";
import { Util } from ".";
import { TranxUtil } from "./tranx";
import { DebugUtil } from "./debug";
import { IType, Type } from "../types";
import { Decor, Modifier, Computer, Updater } from "../types/decor";
import { Props, State } from "../types/model";

@DebugUtil.is(self => `${self.model.name}::state`)
export class StateUtil<
    M extends Model = Model,
    S extends Props.S = Props.S,
> extends Util<M> {

    private static registry: Map<Function, Record<string, Array<(self: Model) => Computer | undefined>>> = new Map();
    private static registry2: Map<Function, Type<Decor, [Model]>> = new Map();

    public static use<S extends Props.S>(decor: Type<Decor<S>, [Model]>) {
        return function (type: Type<Model<{}, S>>) {
            StateUtil.registry2.set(type, decor)
        }
    }


    public static on<S extends Props.S, M extends Model, I extends Model>(
        accessor: (self: I) => Computer<S, M> | undefined
    ) {
        return function(
            prototype: I,
            key: string,
            descriptor: TypedPropertyDescriptor<Updater<S, M>>
        ): TypedPropertyDescriptor<Updater<S, M>> {
            const hooks = StateUtil.registry.get(prototype.constructor) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(accessor);
            StateUtil.registry.set(prototype.constructor, hooks);
            return descriptor;
        }
    }

    public readonly origin: S
    
    private readonly router: {
        consumers: Map<Computer, Modifier[]>,
        producers: Map<Updater, Computer[]>
    }

    private _current: State<S>
    public get current() { return { ...this._current } }
    
    constructor(model: M, props: State<S>) {
        super(model);
        this.router = {
            consumers: new Map(),
            producers: new Map()
        }
        this._current = { ...props }
        this.origin = new Proxy({ ...props }, {
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this),
        })
    }


    @TranxUtil.span()
    private toReload() {
        // reload instead
    }

    public check(context: Set<StateUtil>, path?: string, type?: IType<Model>) {
        if (context.has(this)) return;
        context.add(this);
        const child: Props.C = this.utils.child.current;
        // avoid loop
        if (!path) {
            if (!type) this.toReload();
            if (!type) return;
            if (this.model instanceof type) this.toReload();
            Object.keys(child).forEach(key => {
                const value = child[key];
                if (value instanceof Array) {
                    value.filter(item => item instanceof type)
                        .forEach(item => item.utils.state.check(context, path, type))
                }
                if (value instanceof Model) value.utils.state.check(context, path, type)
            })
        } else {
            const keys = path.split('/');
            const key = keys.shift();
            path = keys.join('/');
            if (!key) return;
            const value = child[key];
            if (value instanceof Array) value.forEach(item => item.utils.state.check(context, path, type))
            if (value instanceof Model) value.utils.state.check(context, path, type);
        }
    } 

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

    public update() {
        let path: string | undefined;
        let parent: Model | undefined = this.model;
        const consumers: Modifier[] = [];
        while (parent) {
            const router = parent.utils.state.router;
            router.consumers.forEach((list, producer) => {
                if (producer.type) {
                    if (!(this.model instanceof producer.type)) return;
                    if (!(path ?? '').startsWith(producer.path ?? '')) return;
                } else if (path !== producer.path) return;
                consumers.push(...list);
            })
            if (path) path = parent.utils.route.key + '/' + path;
            else path = parent.utils.route.key;
            parent = parent.utils.route.current.parent;
        }
        let type: Type<Decor, [Model]> | undefined;
        let constructor: any = this.model.constructor;
        while (constructor && !type) {
            type = StateUtil.registry2.get(constructor);
            constructor = constructor.__proto__
        }
        if (!type) {
            this._current = { ...this.origin };
            return;
        }
        let decor: Decor<any> = new type(this.model);
        consumers.sort((a, b) => a.model.uuid.localeCompare(b.model.uuid));
        consumers.forEach(item => item.updater.call(item.model, this.model, decor));
        this._current = decor.result;
    }

    public bind<S extends Props.S, M extends Model>(
        producer: Computer<S, M>, 
        updater: Updater<S, M>
    ) {
        const { model: that, path, type } = producer;
        if (!this.utils.route.check(that)) return;
        const consumers = that.utils.state.router.consumers.get(producer) ?? [];
        const producers = this.router.producers.get(updater) ?? [];
        consumers.push({ model: this.model, updater });
        producers.push(producer);
        that.utils.state.router.consumers.set(producer, consumers);
        this.router.producers.set(updater, producers);
        that.utils.state.check(new Set(), path, type);
    }
    
    public unbind<S extends Props.S, M extends Model>(
        producer: Computer<S, M>, 
        updater: Updater<S, M>
    ) {
        const { model: that, path, type } = producer;
        const comsumers = that.utils.state.router.consumers.get(producer) ?? [];
        const producers = this.router.producers.get(updater) ?? [];
        let index = comsumers.findIndex(item => (
            item.updater === updater && 
            item.model === this.model
        ));
        if (index !== -1) comsumers.splice(index, 1);
        index = producers.indexOf(producer);
        if (index !== -1) producers.splice(index, 1);
        that.utils.state.check(new Set(), path, type);
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
    }

    public unload() {
        this.router.producers.forEach((list, handler) => {
            [...list].forEach(item => this.unbind(item, handler));
        });
        this.router.consumers.forEach((list, producer) => {
            [...list].forEach(item => {
                const { model: that, updater } = item;
                if (this.utils.route.check(that)) return;
                that.utils.state.unbind(producer, updater);
            });
        });
    }

    public reload() {
        this.unload();
        this.load();
    }

    public debug() {
        const dependency: string[] = [];
        this.router.producers.forEach(item => dependency.push(...item.map(item => item.model.name)))
        this.router.consumers.forEach(item => dependency.push(...item.map(item => item.model.name)))
        console.log('🔍 dependency', dependency);
    }
}

