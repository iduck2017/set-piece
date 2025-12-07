import { Plugin } from "../plugins";
import { Model } from "../model";
import { Frame } from "../types/model";
import { IClass, Method } from "../types";
import { Event } from "../types/event";

export class TranxService {
    private constructor() {}

    private static _isLocked = false;
    public static get isLocked() { return TranxService._isLocked; }

    private static tasks: Array<() => void> = [];
    private static readonly state: Set<Model> = new Set()
    private static readonly refer: Set<Model> = new Set()
    private static readonly child: Set<Model> = new Set()
    private static readonly route: Set<Model> = new Set()
    public static readonly event: Map<Model, Frame<Model>> = new Map()

    public static then() {
        return function(
            prototype: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Method<void>>
        ): TypedPropertyDescriptor<Method<void>> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: unknown, ...args: any[]) {
                    if (!TranxService._isLocked) return handler.call(this, ...args);
                    else TranxService.tasks.push(() => handler.call(this, ...args));
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

    public static span(isType: true): (constructor: IClass<Model>) => void;
    public static span(): (
        prototype: Object, 
        key: string, 
        descriptor: TypedPropertyDescriptor<Method>
    ) => TypedPropertyDescriptor<Method>;
    public static span(isType?: boolean): any {
        if (isType) {
            return function (type: IClass<Model>) {
                const instance = {
                    [type.name]: class extends type {
                        constructor(...args: any[]) {
                            if (TranxService._isLocked) {
                                super(...args);
                                TranxService.add(this, TranxService.route)
                            }
                            else {
                                TranxService._isLocked = true;
                                super(...args);
                                TranxService.add(this, TranxService.route)
                                TranxService.reload();
                                TranxService._isLocked = false;
                                TranxService.end();
                            }
                        }
                    }
                }
                return instance[type.name];
            }
        } 
        return function(
            prototype: unknown,
            key: string,
            descriptor: TypedPropertyDescriptor<Method>
        ): TypedPropertyDescriptor<Method> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: unknown, ...args: any[]) {
                    if (this instanceof Plugin) {
                        const model: Model = this.model;
                        const isStateChange = model.utils.state === this;
                        const isReferChange = model.utils.refer === this;
                        const isChildChange = model.utils.child === this;
                        const isRouteChange = model.utils.route === this;
                        if (isStateChange) TranxService.add(model, TranxService.state);
                        if (isReferChange) TranxService.add(model, TranxService.refer);
                        if (isChildChange) TranxService.add(model, TranxService.child);
                        if (isRouteChange) TranxService.add(model, TranxService.route);
                    }
                    if (TranxService._isLocked) {
                        return handler.call(this, ...args);
                    } else {
                        TranxService._isLocked = true;
                        const result = handler.call(this, ...args);
                        TranxService.reload();
                        TranxService._isLocked = false;
                        TranxService.end();
                        return result;
                    }
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

    private static add(model: Model, group: Set<Model>) {
        if (!TranxService.event.has(model)) {
            TranxService.event.set(model, {
                state: model.state,
                refer: model.refer,
                route: model.route,
                child: model.child,
            })
        }
        group.add(model);
    }

    private static reload() {
        // route 
        let route = new Set(TranxService.route);
        route.forEach(item => item.utils.route.update());
        // child
        let child = new Set(TranxService.child);
        child.forEach(item => item.utils.child.update());
        // refer
        let refer = new Set(TranxService.refer);
        route.forEach(item => item.utils.refer.reload());
        refer.forEach(item => item.utils.refer.reload());
        refer = new Set(TranxService.refer);
        refer.forEach(item => item.utils.refer.update());
        // decor
        let state = new Set(TranxService.state);
        route.forEach(item => item.utils.state.reload());
        state.forEach(item => item.utils.state.reload());
        let loop = 0;
        state = new Set(TranxService.state);
        route.forEach(item => item.utils.state.update());
        state.forEach(item => item.utils.state.update());
        // event
        route.forEach(item => item.utils.event.reload());
        TranxService.state.clear();
        TranxService.refer.clear();
        TranxService.child.clear();
        TranxService.route.clear();
    }

    /**
     * 1. avoid middle status machine
     * 2. yield garbage collection
     * 3. controll the process
     */
    private static end() {
        const event = new Map(TranxService.event);
        const tasks = TranxService.tasks;
        TranxService.event.clear();
        TranxService.tasks = [];
        tasks.forEach(task => task());
        event.forEach((item, model) => {
            model.utils.event.current.onChange(new Event(item))
        });
    }
}