import { Agent } from "@/agent";
import { Model } from "@/model";
import { Callback, Value } from "@/types";
import { ModelCycle } from "@/utils/cycle";

export class TranxService {
    private constructor() {}

    private static _isSpan = false;
    public static get isSpan() { return TranxService._isSpan; }

    private static readonly registry: Readonly<{
        cycle: Map<Model, Model>,
        state: Map<Model, Model.State>,
        refer: Map<Model, Model.Refer>,
        child: Map<Model, Model.Child>,
    }> = {
        cycle: new Map(),
        refer: new Map(),
        state: new Map(),
        child: new Map(),
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
                    if (agent.route === this && !registry.cycle.has(this.target)) {
                        registry.cycle.set(this.target, this.target.route)
                    }
                    if (this.target._cycle === this && !registry.cycle.has(this.target)) {
                        registry.cycle.add(this.target)
                    }

                    if (TranxService._isSpan) {
                        const result = handler.call(this, ...args);
                        console.groupEnd()
                        return result;
                    }

                    TranxService._isSpan = true;
                    const result = handler.call(this, ...args);
                    
                    const refer = [...TranxService.registry.refer];
                    const child = [...TranxService.registry.child];
                    const state = [...TranxService.registry.state];
                    const route = [...TranxService.registry.cycle];
                    const cycle = [...TranxService.registry.cycle];

                    TranxService.registry.child.clear();
                    TranxService.registry.state.clear();
                    TranxService.registry.refer.clear();
                    TranxService.registry.cycle.clear();
                    TranxService.registry.cycle.clear();

                    TranxService._isSpan = false;

                    console.log(
                        'tranx', 
                        'refer', refer.length, 
                        'child', child.length, 
                        'state', state.length, 
                        'route', route.length, 
                        'cycle', cycle.length
                    )

                    
                    for (const model of cycle) {
                        if (model) model._cycle.uninit();
                    }
                    for (const [model, prev] of child) {
                        const next = model.child;
                        model._agent.event.current.onChildChange({ prev, next })
                    }
                    for (const [model, prev] of refer) {
                        const next = model.refer;
                        model._agent.event.current.onReferChange({ prev, next })
                    }
                    for (const [model, prev] of state) {
                        const next = model.state;
                        console.log({ prev, next })
                        model._agent.event.current.onStateChange({ prev, next })
                    }
                    for (const [model, prev] of route) {
                        const next = model.route;
                        model._agent.event.current.onParentChange({ prev, next })
                    }

                    console.groupEnd()
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }



    public static task() {}
}