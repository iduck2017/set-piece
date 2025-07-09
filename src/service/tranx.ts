import { Callback } from "../types";
import { Agent } from "../agent/agent";
import { Model } from "../model";
import { DebugService, LogLevel } from "./debug";

export class TranxService {
    private constructor() {}

    private static _isLock = false;
    public static get isLock() { return TranxService._isLock; }

    private static readonly state: Map<Model, Model['state']> = new Map();
    private static readonly refer: Map<Model, Model['refer']> = new Map();
    private static readonly child: Map<Model, Model['child']> = new Map();
    private static readonly route: Map<Model, Model['route']> = new Map();

    public static span(): (prototype: Object, key: string, descriptor: TypedPropertyDescriptor<Callback>) => TypedPropertyDescriptor<Callback>;
    public static span(isType: true): (constructor: new (...props: any[]) => Model) => any;
    public static span(isType?: boolean) {
        if (isType) {
            return function (constructor: new (...props: any[]) => Model) {
                return class Model extends constructor {
                    constructor(...args: any[]) {
                        if (TranxService._isLock) super(...args);
                        else {
                            const isDebug = DebugService.level <= LogLevel.DEBUG;
                            if (isDebug) console.group('%cTransaction::Constructor', 'color: gray')
                            TranxService._isLock = true;
                            super(...args);
                            TranxService.reload();
                            TranxService._isLock = false;
                            if (isDebug) console.groupEnd()
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
                        const isEventEmit = model.agent.event === this && instance[key] === model.agent.event.yield;
                        if (isStateChange && !TranxService.state.has(model)) TranxService.state.set(model, model.state);
                        if (isReferChange && !TranxService.refer.has(model)) TranxService.refer.set(model, model.refer);
                        if (isChildChange && !TranxService.child.has(model)) TranxService.child.set(model, model.child);
                        if (isRouteChange && !TranxService.route.has(model)) TranxService.route.set(model, model.route);
                    }
                    if (TranxService._isLock) {
                        return handler.call(this, ...args);
                    } else {
                        const isDebug = DebugService.level <= LogLevel.DEBUG;
                        if (isDebug) console.group(`%cTransaction::${key}`, 'color: gray')
                        TranxService._isLock = true;
                        const result = handler.call(this, ...args);
                        TranxService.reload();
                        TranxService._isLock = false;
                        if (isDebug) console.groupEnd()
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
        TranxService.route.forEach((info, item) => {
            if (!info.parent && !item.agent.route.isRoot) return;
            item.agent.route.unload();
        })
        TranxService.refer.forEach((info, item) => item.agent.refer.unload());
        TranxService.route.forEach((info, item) => {
            const parent = item.agent.route.parent;
            if (!parent?.agent.route.isLoad && !item.agent.route.isRoot) return;
            item.agent.route.load();
        })
        TranxService.state.forEach((info, item) => item.agent.state.emit());
    }


    private static emit() {
        const state = new Map(TranxService.state);
        const refer = new Map(TranxService.refer);
        const child = new Map(TranxService.child);
        const route = new Map(TranxService.route);
        TranxService.state.clear();
        TranxService.refer.clear();
        TranxService.child.clear();
        TranxService.route.clear();
        state.forEach((info, model) => model.agent.event.current.onStateChange({ prev: info, next: model.state }));
        refer.forEach((info, model) => model.agent.event.current.onReferChange({ prev: info, next: model.refer }));
        child.forEach((info, model) => model.agent.event.current.onChildChange({ prev: info, next: model.child }));
        route.forEach((info, model) => model.agent.event.current.onRouteChange({ prev: info, next: model.route }));
    }

}