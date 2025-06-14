import { Agent } from "../agent/agent";
import { Model } from "../model";

type Callback = (...args: any[]) => any

export class TrxService {
    private constructor() {}

    private static _isSpan = false;

    public static get isSpan() { return TrxService._isSpan; }

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
            return function (
                constructor: new (...props: any[]) => Model
            ) {
                const result: any = 
                    class Model extends constructor {
                        constructor(...args: any[]) {
                            if (TrxService._isSpan) {
                                super(...args);
                            } else {
                                TrxService._isSpan = true;
                                super(...args);
                                TrxService.reload();
                                TrxService._isSpan = false;
                                TrxService.emit();
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
                        const model = this.model;
                        const isStateChange = model.agent.state === this;
                        const isReferChange = model.agent.refer === this;
                        const isChildChange = model.agent.child === this;
                        const isRouteChange = model.agent.route === this;
                        const prev = TrxService.reg.get(model) ?? {};
                        const next = { ...prev }
                        if (isStateChange && !prev.state) next.state = model.state;
                        if (isReferChange && !prev.refer) next.refer = model.refer;
                        if (isChildChange && !prev.child) next.child = model.child;
                        if (isRouteChange && !prev.route) next.route = model.route;
                        TrxService.reg.set(model, next);
                    }

                    if (TrxService._isSpan) {
                        return handler.call(this, ...args);
                    } else {
                        console.group('Transaction::' + key)
                        TrxService._isSpan = true;
                        const result = handler.call(this, ...args);
                        TrxService.reload();
                        TrxService._isSpan = false;
                        console.groupEnd()
                        TrxService.emit();
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
        TrxService.reg.forEach((info, model) => {
            if (!info.route) return;
            const parent = info.route.parent;
            if (parent || model.agent.route.isRoot) {
                queue.unload.push(model);
            }
        })
        TrxService.reg.forEach((info, model) => {
            if (info.refer) queue.unbind.push(model);
        })
        queue.unload.forEach(model => model.agent.route.unload());
        queue.unbind.forEach(model => {
            if (queue.unload.includes(model)) return;
            model.agent.refer.unload();
        })
        TrxService.reg.forEach((info, model) => {
            if (!info.route) return;
            const parent = model.agent.route.parent;
            if (parent?.agent.route.isLoad || model.agent.route.isRoot) {
                queue.load.push(model);
            }
        })
        queue.load.forEach(model => model.agent.route.load());
        console.log('task', {
            unbind: queue.unbind.map(model => model.name),
            unload: queue.unload.map(model => model.name),
            load: queue.load.map(model => model.name),
        })
    }


    private static emit() {
        const reg = new Map(TrxService.reg);
        TrxService.reg.clear();
        for (const [model, info] of reg) {
            const { state, refer, child, route } = model.model;
            const event = model.agent.event.current;
            if (info.state) event.onStateChange({ prev: info.state, next: state })
            if (info.refer) event.onReferChange({ prev: info.refer, next: refer })
            if (info.child) event.onChildChange({ prev: info.child, next: child })
            if (info.route) event.onRouteChange({ prev: info.route, next: route })
        }
    }

}