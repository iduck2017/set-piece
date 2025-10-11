import { Model } from "../model";
import { Primitive } from "utility-types";
import { DeepReadonly } from "utility-types";
import { Computer, Decor, Modifier, Updater } from "../types/decor";
import { Util } from ".";
import { IClass, Method } from "../types";
import { TranxUtil } from "./tranx";

export type State<S> = { 
    [K in keyof S]: S[K] extends Primitive ? S[K] : DeepReadonly<S[K]> 
}

export class StateUtil<
    M extends Model = Model, 
    S extends Model.S = {}
> extends Util<M> {
    
    // static
    private static registry: {
        checker: Map<Function, string[]>
        handler: Map<Function, Record<string, Array<Method<Updater>>>>,
    } = {
        handler: new Map(),
        checker: new Map()
    };

    public static on<
        S extends Model.S,
        I extends Model, 
        M extends Model
    >(updater: (self: I) => Updater<M>) {
        return function(
            prototype: I,
            key: string,
            descriptor: TypedPropertyDescriptor<() => Computer<S, M> | undefined>
        ): TypedPropertyDescriptor<() => Computer<S, M> | undefined> {
            const type = prototype.constructor;
            const hooks = StateUtil.registry.handler.get(type) ?? {};
            if (!hooks[key]) hooks[key] = [];
            hooks[key].push(updater);
            StateUtil.registry.handler.set(type, hooks);
            return descriptor;
        };
    }

    public static if<I extends Model>() {
        return function(
            prototype: I,
            key: string,
            descriptor: TypedPropertyDescriptor<() => boolean>
        ): TypedPropertyDescriptor<() => any> {
            const type = prototype.constructor;
            const hooks = StateUtil.registry.checker.get(type) ?? []
            hooks.push(key);
            StateUtil.registry.checker.set(type, hooks);
            return descriptor;
        };
    }


    // instance
    private readonly router: {
        consumers: Map<Computer, Modifier[]>,
        producers: Map<Updater, Computer[]>
    }

    public readonly origin: State<S>
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
    private toReload() {}

    
    public check(context: Set<StateUtil>, path?: string, type?: IClass<Model>) {
        if (context.has(this)) return;
        context.add(this);
        const child: Model.C = this.utils.child.current;

        // check type @todo
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
            // check path
            const keys = path.split('/');
            const key = keys.shift();
            path = keys.join('/');
            if (!key) return;
            const value = child[key];
            if (value instanceof Array) value.forEach(item => item.utils.state.check(context, path, type))
            if (value instanceof Model) value.utils.state.check(context, path, type);
        }
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
        let decor: any = this.model.decor;
        if (!decor) {
            this._current = { ...this.origin }
            return;
        }
        consumers.sort((a, b) => a.model.uuid.localeCompare(b.model.uuid));
        consumers.forEach(item => item.updater.call(item.model, this.model, decor));
        this._current = decor.result;
    }


    public bind<S extends Model.S, M extends Model>(
        producer: Computer<S, M>, 
        updater: Updater<M>
    ) {
        const { model: that, path, type } = producer;
        if (!this.utils.route.compare(that)) return;
        const consumers = that.utils.state.router.consumers.get(producer) ?? [];
        const producers = this.router.producers.get(updater) ?? [];
        consumers.push({ model: this.model, updater });
        producers.push(producer);
        that.utils.state.router.consumers.set(producer, consumers);
        this.router.producers.set(updater, producers);
        that.utils.state.check(new Set(), path, type);
    }
    
    public unbind<S extends Model.S, M extends Model>(
        producer: Computer<S, M>, 
        updater: Updater<M>
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
        // check
        let constructor: any = this.model.constructor;
        while (constructor) {
            const keys = StateUtil.registry.checker.get(constructor) ?? [];
            for (const key of keys) {
                const validator: any = Reflect.get(this.model, key);
                if (!validator) continue;
                if (!validator.call(this.model)) return;
            }
            constructor = constructor.__proto__;
        }

        // load
        constructor = this.model.constructor;
        while (constructor) {
            const registry = StateUtil.registry.handler.get(constructor) ?? {};
            Object.keys(registry).forEach(key => {
                // get producer
                const computerFact: any = Reflect.get(this.model, key);
                if (!computerFact) return;
                const computer: Computer = computerFact.bind(this.model)();
                // cancel
                if (!computer) return;
                
                // get handlers
                const handlersFact = registry[key]
                const handlers = handlersFact?.map(item => {
                    return item.bind(this.model)(this.model);
                });
                // bind
                handlers?.forEach(item => this.bind(computer, item));
            })
            constructor = constructor.__proto__
        }
    }

    public unload() {
        this.router.producers.forEach((list, handler) => {
            [...list].forEach(item => this.unbind(item, handler));
        });
        this.router.consumers.forEach((list, producer) => {
            [...list].forEach(item => {
                const { model: that, updater } = item;
                if (this.utils.route.compare(that)) return;
                that.utils.state.unbind(producer, updater);
            });
        });
    }

    public reload() {
        this.unload();
        this.load();
    }



    // proxy operation
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

}