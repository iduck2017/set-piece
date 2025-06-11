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


    public static use(): (target: Object, key: string, descriptor: TypedPropertyDescriptor<Callback>) => TypedPropertyDescriptor<Callback>;
    public static use(isType: true): (constructor: new (...props: any[]) => Model) => any;
    public static use(isType?: boolean) {
        if (isType) {
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
        return function(
            target: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: unknown, ...args: any[]) {
                    if (this instanceof Agent) {
                        const target = this.target;
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
                        console.group('Transaction::' + key)
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
            unload: Model[],
            unbind: Model[],
        } = {
            load: [],
            unload: [],
            unbind: [],
        }
        TranxService.registry.forEach((info, model) => {
            const parent = info.route?.parent;
            if (parent || model.agent.route.isRoot) {
                queue.unload.push(model);
            }
        })
        TranxService.registry.forEach((info, model) => {
            if (info.refer) queue.unbind.push(model);
        })
        console.log('unbind', queue.unbind.map(model => model.name))
        console.log('unload', queue.unload.map(model => model.name))
        queue.unload.forEach(model => model.agent.route.unload());
        queue.unbind.forEach(model => {
            if (queue.unload.includes(model)) return;
            model.agent.refer.unload();
        })
        TranxService.registry.forEach((info, model) => {
            const parent = model.agent.route.parent;
            if (parent?.agent.route.isLoad || model.agent.route.isRoot) {
                queue.load.push(model);
            }
        })
        console.log('load', queue.load.map(model => model.name))
        queue.load.forEach(model => model.agent.route.load());
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