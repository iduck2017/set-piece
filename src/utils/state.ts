import { Model } from "../model";
import { Computer, Modifier, Updater } from "../types/decor";
import { Util } from ".";
import { IClass, Method, State } from "../types";
import { TranxUtil } from "./tranx";


export class StateUtil<
    M extends Model = Model, 
    S extends Model.S = {}
> extends Util<M> {
    
    // static
    private static registry: {
        checkers: Map<Function, string[]>
        handlers: Map<Function, Record<string, Array<Method<Updater>>>>,
    } = {
        handlers: new Map(),
        checkers: new Map()
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

            const registry = StateUtil.registry.handlers;
            const config = registry.get(type) ?? {};
            if (!config[key]) config[key] = [];
            config[key].push(updater);

            registry.set(type, config);
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
            
            const registry = StateUtil.registry.checkers;
            const config = registry.get(type) ?? []
            config.push(key);
            registry.set(type, config);
            
            return descriptor;
        };
    }


    // instance
    private readonly router: {
        modifiers: Map<Computer, Modifier[]>,
        computers: Map<Updater, Computer[]>
    }

    public readonly origin: State<S>

    private _current: State<S>
    public get current() { return { ...this._current } }

    constructor(model: M, props: State<S>) {
        super(model);
        this.router = {
            modifiers: new Map(),
            computers: new Map()
        }
        this._current = { ...props }
        this.origin = new Proxy({ ...props }, {
            set: this.set.bind(this),
            deleteProperty: this.del.bind(this),
        })
    }

    
    @TranxUtil.span()
    private preload() {}

    private find(keys: Array<string | IClass>, type?: IClass): Model[] {
        keys = [...keys];

        const result: Model[] = [];
        const child: Model.C = this.utils.child.current;
        if (type) {
            // check self
            if (this.model instanceof type) result.push(...this.find(keys));
            // check child
            Object.keys(child).forEach(key => {
                const value = child[key];
                if (value instanceof Array) {
                    value.forEach(item => {
                        const subResult = item.utils.state.find(keys, type);
                        result.push(...subResult);
                    })
                }
                if (value instanceof Model) {
                    const subResult = value.utils.state.find(keys, type);
                    result.push(...subResult);
                }
            })
            return result;
        }
      
        const key = keys.shift();
        if (!key) return [this.model];

        if (typeof key === 'string') {
            // find by key
            const value = child[key];
            if (!value) return [];
            if (value instanceof Array) {
                value.forEach(item => {
                    const subResult = item.utils.state.find(keys);
                    result.push(...subResult);
                });
            } 
            if (value instanceof Model) {
                const subResult = value.utils.state.find(keys);
                result.push(...subResult);
            }
        } 
        else {
            // find by type
            const subResult = this.utils.state.find(keys, key);
            result.push(...subResult);
        }
        return result;
    } 


    public update() {
        let parent: Model | undefined = this.model;
        const modifiers: Modifier[] = [];
        const keys: string[] = [];
        const route = this.utils.route;

        while (parent) {
            const router = parent.utils.state.router;
            router.modifiers.forEach((items, computer) => {
                const steps = route.locate(computer.model);
                const matched = route.validate(steps, computer.keys);
                if (!matched) return;
                modifiers.push(...items);
            })
            const key = parent.utils.route.key;
            if (key) keys.unshift(key);
            parent = parent.utils.route.current.parent;
        }
        let decor: any = this.model.decor;
        if (!decor) this._current = { ...this.origin }
        if (!decor) return;

        modifiers.sort((a, b) => a.model.uuid.localeCompare(b.model.uuid));
        modifiers.forEach(item => {
            item.updater.call(item.model, this.model, decor)
        });
        this._current = decor.result;
    }


    public bind<S extends Model.S, M extends Model>(
        computer: Computer<S, M>, 
        updater: Updater<M>
    ) {
        const { model, keys } = computer;
        if (!this.utils.route.compare(model)) return;

        // modifiers
        const that = model.utils.state;
        const modifiers = that.router.modifiers.get(computer) ?? [];
        modifiers.push({ model: this.model, updater });
        that.router.modifiers.set(computer, modifiers);

        // computers
        const computers = this.router.computers.get(updater) ?? [];
        computers.push(computer);
        this.router.computers.set(updater, computers);
        
        const child = that.find(keys);
        child.forEach(item => item.utils.state.preload());
    }
    
    public unbind<S extends Model.S, M extends Model>(
        computer: Computer<S, M>, 
        updater: Updater<M>
    ) {
        const { model, keys } = computer;
        const that = model.utils.state;

        // modifiers
        const modifiers = that.router.modifiers.get(computer) ?? [];
        let index = modifiers.findIndex(item => (
            item.updater === updater && 
            item.model === this.model
        ));
        if (index !== -1) modifiers.splice(index, 1);

        // computers
        const computers = this.router.computers.get(updater) ?? [];
        index = computers.indexOf(computer);
        if (index !== -1) computers.splice(index, 1);

        const child = that.find(keys);
        child.forEach(item => item.utils.state.preload());
    }

    
    public load() {
        // check
        let constructor: any = this.model.constructor;
        while (constructor) {
            const keys = StateUtil.registry.checkers.get(constructor) ?? [];
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
            const registry = StateUtil.registry.handlers.get(constructor) ?? {};
            Object.keys(registry).forEach(key => {
                const factory: {
                    computer?: any,
                    handler?: Array<Method<Updater>>
                } = {
                    computer: Reflect.get(this.model, key),
                    handler: registry[key]
                }

                // get computer
                if (!factory.computer) return;
                const computer: Computer = factory.computer.bind(this.model)();
                if (!computer) return;

                // bind
                if (!factory.handler) return;
                const handlers = factory.handler.map(item => {
                    return item.bind(this.model)(this.model);
                });
                if (!handlers) return;
                handlers.forEach(item => this.bind(computer, item));

            })
            constructor = constructor.__proto__
        }
    }

    public unload() {
        const computers = this.router.computers;
        computers.forEach((items, handler) => {
            items = [...items];
            items.forEach(item => this.unbind(item, handler));
        });

        const modifiers = this.router.modifiers;
        modifiers.forEach((items, computer) => {
            items = [...items];
            items.forEach(item => {
                const { model, updater } = item;
                if (this.utils.route.compare(model)) return;
                model.utils.state.unbind(computer, updater);
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