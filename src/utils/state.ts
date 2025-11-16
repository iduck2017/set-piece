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
                    value.forEach(item => result.push(
                        ...item.utils.state.find(keys, type))
                    )
                }
                if (value instanceof Model) {
                    result.push(...value.utils.state.find(keys, type));
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
                value.forEach(item => result.push(
                    ...item.utils.state.find(keys))
                );
            } 
            else result.push(...value.utils.state.find(keys));
        } else {
            // find by type
            result.push(...this.utils.state.find(keys, key));
        }
        return result;
    } 


    public update() {
        let parent: Model | undefined = this.model;
        const modifiers: Modifier[] = [];
        const keys: string[] = [];
        while (parent) {
            const router = parent.utils.state.router;
            router.modifiers.forEach((items, computer) => {
                const steps = this.utils.route.locate(computer.model);
                const matched = this.utils.route.validate(steps, computer.keys);
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
        modifiers.forEach(item => item.updater.call(item.model, this.model, decor));
        this._current = decor.result;
    }


    public bind<S extends Model.S, M extends Model>(
        computer: Computer<S, M>, 
        updater: Updater<M>
    ) {
        const { model: that, keys } = computer;
        if (!this.utils.route.compare(that)) return;

        const modifiers = that.utils.state.router.modifiers.get(computer) ?? [];
        const computers = this.router.computers.get(updater) ?? [];
        modifiers.push({ model: this.model, updater });
        computers.push(computer);
        that.utils.state.router.modifiers.set(computer, modifiers);
        this.router.computers.set(updater, computers);
        
        const child = that.utils.state.find(keys);
        child.forEach(item => item.utils.state.preload());
    }
    
    public unbind<S extends Model.S, M extends Model>(
        computer: Computer<S, M>, 
        updater: Updater<M>
    ) {
        const { model: that, keys } = computer;
        const modifiers = that.utils.state.router.modifiers.get(computer) ?? [];
        const computers = this.router.computers.get(updater) ?? [];
        let index = modifiers.findIndex(item => (
            item.updater === updater && 
            item.model === this.model
        ));
        if (index !== -1) modifiers.splice(index, 1);
        index = computers.indexOf(computer);
        if (index !== -1) computers.splice(index, 1);

        const child = that.utils.state.find(keys);
        child.forEach(item => item.utils.state.preload());
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
                // get computer
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
        this.router.computers.forEach((items, handler) => {
            [...items].forEach(item => this.unbind(item, handler));
        });
        this.router.modifiers.forEach((items, computer) => {
            [...items].forEach(item => {
                const { model: that, updater } = item;
                if (this.utils.route.compare(that)) return;
                that.utils.state.unbind(computer, updater);
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