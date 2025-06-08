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
                        if (TranxService._isSpan) {
                            super(...args);
                        } else {
                            console.group('Transaction::' + args[0].state.name)
                            TranxService._isSpan = true;
                            super(...args);
                            TranxService.reload();
                            TranxService._isSpan = false;
                            console.groupEnd()
                            TranxService.emit();
                        }
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


                    if (TranxService._isSpan) {
                        return handler.call(this, ...args);
                    } else {
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
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }


    private static reload() {
        const queue: {
            load: Model[],
            bind: Model[],
            done: Model[]
        } = {
            load: [],
            bind: [],
            done: [],
        }
        TranxService.registry.forEach((info, model) => {
            if (info.route) {
                const descendants = model.agent.child.descendants;
                queue.load.push(model, ...descendants);
            }
        })
        queue.load.forEach(model => {
            if (queue.done.includes(model)) return;
            queue.done.push(model);
            model.agent.route.unload();
            model.agent.route.uninit();
            model.agent.route.load();
        })


        TranxService.registry.forEach((info, model) => {
            if (info.refer) queue.bind.push(model);
        })
        queue.bind.forEach(model => {
            if (queue.done.includes(model)) return;
            queue.done.push(model);
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
}