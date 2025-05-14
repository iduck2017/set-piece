import { Agent } from "@/agent";
import { Model } from "@/model";
import { Callback, Value } from "@/types";
import { ModelStatus } from "@/types/model";
import { ModelCycle } from "@/utils/cycle";

export class TranxService {
    private constructor() {}

    private static _isSpan = false;
    public static get isSpan() { return TranxService._isSpan; }

    private static readonly registry: Readonly<{
        state: Map<Model, Model.State>,
        refer: Map<Model, Model.Refer>,
        child: Map<Model, Model.Child>,
        route: Map<Model, Model.Route>,
        cycle: Set<Model>
    }> = {
        cycle: new Set(),
        state: new Map(),
        refer: new Map(),
        child: new Map(),
        route: new Map(),
    }

    public static span() {
        return function(
            target: Model | Agent | ModelCycle,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Model | Agent | ModelCycle, ...args: any[]) {
                    const namespace = this.constructor.name + '::transaction'
                    console.group(namespace)

                    const registry = TranxService.registry;
                    const agent = this.target._agent;
                    
                    if (agent.state === this && !registry.state.has(this.target)) {
                        registry.state.set(this.target, this.target.state)
                    }
                    if (agent.refer === this && !registry.refer.has(this.target)) {
                        registry.refer.set(this.target, this.target.refer)
                    }
                    if (agent.child === this && !registry.child.has(this.target)) {
                        registry.child.set(this.target, this.target.child)
                    }
                    if (agent.route === this && !registry.route.has(this.target)) {
                        registry.route.set(this.target, this.target.route)
                    }
                    if (this.target._cycle === this && !registry.cycle.has(this.target)) {
                        registry.cycle.add(this.target)
                    }

                    if (TranxService._isSpan) return handler.call(this, ...args);

                    TranxService._isSpan = true;
                    const result = handler.call(this, ...args);
                    
                    const refer = [...TranxService.registry.state];
                    const child = [...TranxService.registry.child];
                    const state = [...TranxService.registry.state];
                    const route = [...TranxService.registry.route];
                    const cycle = [...TranxService.registry.cycle];

                    TranxService.registry.child.clear();
                    TranxService.registry.state.clear();
                    TranxService.registry.refer.clear();
                    TranxService.registry.route.clear();
                    TranxService.registry.cycle.clear();

                    TranxService._isSpan = false;

                    
                    for (const model of cycle) {
                        if (model._cycle.status !== ModelStatus.LOAD) model._cycle.uninit();
                    }
                    for (const [model, prev] of child) {
                        const next = model.child;
                        model._agent.event.emitters.onChildChange({ prev, next })
                    }
                    for (const [model, prev] of refer) {
                        const next = model.refer;
                        model._agent.event.emitters.onReferChange({ prev, next })
                    }
                    for (const [model, prev] of state) {
                        const next = model.state;
                        model._agent.event.emitters.onStateChange({ prev, next })
                    }
                    for (const [model, prev] of route) {
                        const next = model.route;
                        model._agent.event.emitters.onRouteChange({ prev, next })
                    }

                    console.groupEnd()
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

    public static task() {

    }
}