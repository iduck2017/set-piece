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

                    const isStateChange = this.target.agent.state === this;
                    const isReferChange = this.target.agent.refer === this;
                    const isChildChange = this.target.agent.child === this;
                    const isRouteChange = this.target.agent.route === this;

                    const prev = TranxService.registry.get(this.target) ?? {};
                    const next = { ...prev }
                    if (isStateChange && !prev.state) next.state = this.target.state;
                    if (isReferChange && !prev.refer) next.refer = this.target.refer;
                    if (isChildChange && !prev.child) next.child = this.target.child;
                    if (isRouteChange && !prev.route) next.route = this.target.route;
                    TranxService.registry.set(this.target, next);

                    if (TranxService._isSpan) return handler.call(this, ...args);

                    const namespace = 'Transaction'
                    console.group(namespace)

                    TranxService._isSpan = true;

                    const result = handler.call(this, ...args);

                    for (const [model, info] of TranxService.registry) {
                        if (!info.route) continue;
                        model.agent.route.uninit();
                        model.agent.route.unload();
                        model.agent.route.load();
                    }

                    const registry = new Map(TranxService.registry);
                    TranxService.registry.clear();
                    TranxService._isSpan = false;
                    console.groupEnd()

                    for (const [model, info] of registry) {
                        const { state, refer, child, route } = model.target;
                        const event = model.agent.event.current;

                        if (info.state) event.onStateChange({ prev: info.state, next: state })
                        if (info.refer) event.onReferChange({ prev: info.refer, next: refer })
                        if (info.child) event.onChildChange({ prev: info.child, next: child })
                        if (info.route) event.onRouteChange({ prev: info.route, next: route })

                        if (info.state) console.log('stateChange');
                        if (info.refer) console.log('referChange');
                        if (info.child) console.log('childChange');
                        if (info.route) console.log('routeChange');
                    }
                    
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

    public static task() {}
}