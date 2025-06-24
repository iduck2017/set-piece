import { Callback } from "../types";
import { Agent } from "../agent/agent";
import { Model } from "../model";

export class TranxService {
    private constructor() {}

    private static _isLock = false;
    public static get isLock() { return TranxService._isLock; }

    private static readonly registry: Map<Model, Readonly<{
        state?: Model['state'],
        refer?: Model['refer'],
        child?: Model['child'],
        route?: Model['route'],
        event?: []
    }>> = new Map();


    public static use(): (prototype: Object, key: string, descriptor: TypedPropertyDescriptor<Callback>) => TypedPropertyDescriptor<Callback>;
    public static use(isType: true): (constructor: new (...props: any[]) => Model) => any;
    public static use(isType?: boolean) {
        if (isType) {
            return function (constructor: new (...props: any[]) => Model) {
                return class Model extends constructor {
                    constructor(...args: any[]) {
                        if (TranxService._isLock) {
                            super(...args);
                            const prev = TranxService.registry.get(this) ?? {};
                            const next = { ...prev, route: !prev.route ? this.route : prev.route };
                            TranxService.registry.set(this, next);
                        } else {
                            TranxService._isLock = true;
                            super(...args);
                            const prev = TranxService.registry.get(this) ?? {};
                            const next = { ...prev, route: !prev.route ? this.route : prev.route };
                            TranxService.registry.set(this, next);
                            TranxService.reload();
                            TranxService._isLock = false;
                            TranxService.emit();
                        }
                    }
                };
            }
        } 
        return function(
            prototype: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: unknown, ...args: any[]) {
                    if (this instanceof Agent) {
                        const model = this.model;
                        const isStateChange = model.agent.state === this;
                        const isReferChange = model.agent.refer === this;
                        const isChildChange = model.agent.child === this;
                        const isRouteChange = model.agent.route === this;
                        const prev = TranxService.registry.get(model) ?? {};
                        const next = { 
                            ...prev,
                            state: isStateChange && !prev.state ? model.state : prev.state,
                            refer: isReferChange && !prev.refer ? model.refer : prev.refer,
                            child: isChildChange && !prev.child ? model.child : prev.child,
                            route: isRouteChange && !prev.route ? model.route : prev.route,
                        }
                        TranxService.registry.set(model, next);
                    }

                    if (TranxService._isLock) {
                        return handler.call(this, ...args);
                    } else {
                        console.group('Transaction::' + key)
                        TranxService._isLock = true;
                        const result = handler.call(this, ...args);
                        TranxService.reload();
                        TranxService._isLock = false;
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
            calc: Model[],
            unload: Model[],
            unbind: Model[],
        } = {
            load: [],
            calc: [],
            unload: [],
            unbind: [],
        }
        TranxService.registry.forEach((info, item) => {
            if (info.route && (info.route.parent || item.agent.route.isRoot)) queue.unload.push(item);
            if (info.refer) queue.unbind.push(item);
        })
        queue.unload.forEach(item => item.agent.route.unload());
        queue.unbind.forEach(item => {
            if (queue.unload.includes(item)) return;
            item.agent.refer.unload();
        })
        TranxService.registry.forEach((info, item) => {
            const parent = item.agent.route.parent;
            if (info.route && (parent?.agent.route.isLoad || item.agent.route.isRoot)) queue.load.push(item);
        })
        queue.load.forEach(item => item.agent.route.load());
        TranxService.registry.forEach((info, item) => {
            if (info.state) queue.calc.push(item);
        })
        queue.calc.forEach(item => {
            if (queue.unload.includes(item)) return;
            if (queue.load.includes(item)) return;
            item.agent.state.emit()
        });
        if (queue.unbind.length) console.log('unbind:', queue.unbind.map(model => model.name).join(','))
        if (queue.unload.length) console.log('unload:', queue.unload.map(model => model.name).join(','))
        if (queue.load.length) console.log('load:', queue.load.map(model => model.name).join(','))
        if (queue.calc.length) console.log('calc:', queue.calc.map(model => model.name).join(',')) 
    }


    private static emit() {
        const registry = new Map(TranxService.registry);
        TranxService.registry.clear();
        registry.forEach((info, model) => {
            const { state, refer, child, route } = model;
            const event = model.agent.event.current;
            if (info.state) event.onStateChange({ prev: info.state, next: state })
            if (info.refer) event.onReferChange({ prev: info.refer, next: refer })
            if (info.child) event.onChildChange({ prev: info.child, next: child })
            if (info.route) event.onRouteChange({ prev: info.route, next: route })
        })
    }

}