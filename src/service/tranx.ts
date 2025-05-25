import { Agent } from "../agent/agent";
import { Model } from "../model";

type Callback = (...args: any[]) => any

export class TranxService {
    private constructor() {}

    private static _isSpan = false;
    public static get isSpan() { return TranxService._isSpan; }

    private static readonly registry: Map<Model, Readonly<{
        state?: Model.State,
        refer?: Model.Refer,
        child?: Model.Child,
        route?: Model,
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
                    const next = {
                        state: isStateChange ? this.target.state : prev.state,
                        refer: isReferChange ? this.target.refer : prev.refer,
                        child: isChildChange ? this.target.child : prev.child,
                        route: isRouteChange ? this.target.parent : prev.route,
                    }
                    TranxService.registry.set(this.target, next);
                

                    if (TranxService._isSpan) return handler.call(this, ...args);

                    const namespace = this.constructor.name + '::transaction'
                    console.group(namespace)

                    TranxService._isSpan = true;

                    const result = handler.call(this, ...args);

                    const registry = new Map(TranxService.registry);

                    TranxService.registry.clear();

                    TranxService._isSpan = false;
                    console.groupEnd()

                    for (const [model, info] of registry) {
                        const { state, refer, child, route } = info;
                        if (!model.agent.route.isLoad) model.agent.route.uninit(); 

                        if (state) model.agent.event.current.onStateChange({ prev: state, next: this.target.state })
                        if (refer) model.agent.event.current.onReferChange({ prev: refer, next: this.target.refer })
                        if (child) model.agent.event.current.onChildChange({ prev: child, next: this.target.child })
                        if (route) model.agent.event.current.onParentChange({ prev: route, next: this.target.parent })
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