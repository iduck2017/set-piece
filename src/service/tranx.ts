import { Callback } from "../types";
import { Agent } from "../agent/agent";
import { Model } from "../model";

export class TranxService {
    private constructor() {}

    private static _isSpan = false;

    public static get isSpan() { return TranxService._isSpan; }

    private static readonly reg: Map<Model, Readonly<{
        state?: Model['state'],
        refer?: Model['refer'],
        child?: Model['child'],
        route?: Model['route'],
    }>> = new Map();


    public static use(): (target: Object, key: string, descriptor: TypedPropertyDescriptor<Callback>) => TypedPropertyDescriptor<Callback>;
    public static use(isType: true): (constructor: new (...props: any[]) => Model) => any;
    public static use(isType?: boolean) {
        if (isType) {
            return function (constructor: new (...props: any[]) => Model) {
                return class Model extends constructor {
                    constructor(...args: any[]) {
                        if (TranxService._isSpan) {
                            super(...args);
                            const prev = TranxService.reg.get(this) ?? {};
                            const next = { ...prev, route: this.route };
                            TranxService.reg.set(this, next);
                        } else {
                            TranxService._isSpan = true;
                            super(...args);
                            const prev = TranxService.reg.get(this) ?? {};
                            const next = { ...prev, route: this.route };
                            TranxService.reg.set(this, next);
                            TranxService.reload();
                            TranxService._isSpan = false;
                            TranxService.emit();
                        }
                    }
                };
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
                        const model = this.model;
                        const isStateChange = model.agent.state === this;
                        const isReferChange = model.agent.refer === this;
                        const isChildChange = model.agent.child === this;
                        const isRouteChange = model.agent.route === this;
                        const prev = TranxService.reg.get(model) ?? {};
                        const next = { 
                            ...prev,
                            state: isStateChange && !prev.state ? model.state : undefined,
                            refer: isReferChange && !prev.refer ? model.refer : undefined,
                            child: isChildChange && !prev.child ? model.child : undefined,
                            route: isRouteChange && !prev.route ? model.route : undefined,
                        }
                        TranxService.reg.set(model, next);
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
            calc: Model[],
            unload: Model[],
            unbind: Model[],
        } = {
            load: [],
            calc: [],
            unload: [],
            unbind: [],
        }
        TranxService.reg.forEach((info, model) => {
            if (info.route) {
                if (info.route.parent || model.agent.route.isRoot) queue.unload.push(model);
                if (!info.state) queue.calc.push(model);
            }
            if (info.refer) queue.unbind.push(model);
            if (info.state) queue.calc.push(model);
        })
        queue.unload.forEach(model => model.agent.route.unload());
        queue.unbind.forEach(model => {
            if (queue.unload.includes(model)) return;
            model.agent.refer.unload();
        })
        TranxService.reg.forEach((info, model) => {
            if (info.route) {
                const parent = model.agent.route.parent;
                if (parent?.agent.route.isLoad || model.agent.route.isRoot) queue.load.push(model);
            }
        })
        queue.load.forEach(model => model.agent.route.load());
        queue.calc.forEach(model => model.agent.state.emit());
        console.log('task', {
            unbind: queue.unbind.map(model => model.name),
            unload: queue.unload.map(model => model.name),
            load: queue.load.map(model => model.name),
            calc: queue.calc.map(model => model.name),
        })
    }


    private static emit() {
        const reg = new Map(TranxService.reg);
        TranxService.reg.clear();
        for (const [model, info] of reg) {
            const { state, refer, child, route } = model;
            const event = model.agent.event.current;
            if (info.state) event.onStateChange({ prev: info.state, next: state })
            if (info.refer) event.onReferChange({ prev: info.refer, next: refer })
            if (info.child) event.onChildChange({ prev: info.child, next: child })
            if (info.route) event.onRouteChange({ prev: info.route, next: route })
        }
    }

}