import { Agent } from "../agent/agent";
import { Model } from "../model";

type Callback = (...args: any[]) => any

export class TranxService {
    private constructor() {}

    private static _isSpan = false;

    public static get isSpan() { return TranxService._isSpan; }

    private static readonly registry: Map<Model, Readonly<{
        state?: Model['state'],
        refer?: Model['refer'],
        child?: Model['child'],
        route?: Model['route'],
    }>> = new Map();


    public static wrap() {
        return function (
            constructor: new (...props: any[]) => Model
        ) {
            const result: any = 
                class Model extends constructor {
                    constructor(...args: any[]) {
                        console.group('Transaction::' + args[0].state.name)
                        TranxService._isSpan = true;
                        super(...args);
                        TranxService.reload();
                        TranxService._isSpan = false;
                        console.groupEnd()
                        TranxService.emit();
                    }
                };
            return result;
        }
    }

    public static span() {
        return function(
            target: Model | Agent,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Model | Agent, ...args: any[]) {
                    let target = this.target;

                    if (target) {
                        const isStateChange = target.agent.state === this;
                        const isReferChange = target.agent.refer === this;
                        const isChildChange = target.agent.child === this;
                        const isRouteChange = target.agent.route === this;

                        const prev = TranxService.registry.get(target) ?? {};
                        const next = { ...prev }

                        if (isStateChange && !prev.state) next.state = target.state;
                        if (isReferChange && !prev.refer) next.refer = target.refer;
                        if (isChildChange && !prev.child) next.child = target.child;
                        if (isRouteChange && !prev.route) next.route = target.route;
                        TranxService.registry.set(target, next);
                    }


                    if (TranxService._isSpan) return handler.call(this, ...args);

                    console.group('Transaction')
                    TranxService._isSpan = true;
                    const result = handler.call(this, ...args);
                    TranxService.reload();
                    TranxService._isSpan = false;
                    console.groupEnd()
                    TranxService.emit();
                    
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }


    private static reload() {
        let reloader: Model[] = [];
        for (const [model, info] of TranxService.registry) {
            if (info.route) {
                const descendants = model.agent.child.descendants;
                reloader.push(model, ...descendants);
            }
        }
        reloader = reloader.filter((model, index) => {
            if (index === reloader.indexOf(model)) return true;
            return false;
        })
        console.log('reloader', reloader.map(model => model.name))
        reloader.forEach(model => {
            model.agent.route.uninit();
            model.agent.route.unload();
            model.agent.route.load();
        })

        let rebinder: Model[] = [];
        for (const [model, info] of TranxService.registry) {
            if (info.refer) rebinder.push(model);
        }
        rebinder = rebinder.filter((model, index) => {
            if (reloader.includes(model)) return false;
            if (index === rebinder.indexOf(model)) return true;
            return false;
        })
        console.log('rebinder', rebinder.map(model => model.name))
        rebinder.forEach(model => {
            model.agent.refer.unload();
            model.agent.refer.uninit();
        })
    }


    private static emit() {
        const registry = new Map(TranxService.registry);
        TranxService.registry.clear();
        for (const [model, info] of registry) {
            const { state, refer, child, route } = model.target;
            const event = model.agent.event.current;
            if (info.state) event.onStateChange({ prev: info.state, next: state })
            if (info.refer) event.onReferChange({ prev: info.refer, next: refer })
            if (info.child) event.onChildChange({ prev: info.child, next: child })
            if (info.route) event.onRouteChange({ prev: info.route, next: route })
        }
    }

    public static task() {}
}