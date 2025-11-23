import { Util } from ".";
import { Model } from "../model";
import { Frame } from "../types/model";
import { IClass, Method } from "../types";
import { Event } from "../types/event";

export class TranxUtil {
    private constructor() {}

    private static _isLocked = false;
    public static get isLocked() { return TranxUtil._isLocked; }

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
                    if (!TranxUtil._isLocked) return handler.call(this, ...args);
                    else TranxUtil.tasks.push(() => handler.call(this, ...args));
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
                            if (TranxUtil._isLocked) {
                                super(...args);
                                TranxUtil.add(this, TranxUtil.route)
                            }
                            else {
                                TranxUtil._isLocked = true;
                                super(...args);
                                TranxUtil.add(this, TranxUtil.route)
                                TranxUtil.reload();
                                TranxUtil._isLocked = false;
                                TranxUtil.end();
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
                    if (this instanceof Util) {
                        const model: Model = this.model;
                        const isStateChange = model.utils.state === this;
                        const isReferChange = model.utils.refer === this;
                        const isChildChange = model.utils.child === this;
                        const isRouteChange = model.utils.route === this;
                        if (isStateChange) TranxUtil.add(model, TranxUtil.state);
                        if (isReferChange) TranxUtil.add(model, TranxUtil.refer);
                        if (isChildChange) TranxUtil.add(model, TranxUtil.child);
                        if (isRouteChange) TranxUtil.add(model, TranxUtil.route);
                    }
                    if (TranxUtil._isLocked) {
                        return handler.call(this, ...args);
                    } else {
                        TranxUtil._isLocked = true;
                        const result = handler.call(this, ...args);
                        TranxUtil.reload();
                        TranxUtil._isLocked = false;
                        TranxUtil.end();
                        return result;
                    }
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

    private static add(model: Model, group: Set<Model>) {
        if (!TranxUtil.event.has(model)) {
            TranxUtil.event.set(model, {
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
        let route = new Set(TranxUtil.route);
        route.forEach(item => item.utils.route.update());
        // child
        let child = new Set(TranxUtil.child);
        child.forEach(item => item.utils.child.update());
        // refer
        let refer = new Set(TranxUtil.refer);
        route.forEach(item => item.utils.refer.reload());
        refer.forEach(item => item.utils.refer.reload());
        refer = new Set(TranxUtil.refer);
        refer.forEach(item => item.utils.refer.update());
        // decor
        let state = new Set(TranxUtil.state);
        route.forEach(item => item.utils.state.reload());
        state.forEach(item => item.utils.state.reload());
        let loop = 0;
        state = new Set(TranxUtil.state);
        route.forEach(item => item.utils.state.update());
        state.forEach(item => item.utils.state.update());
        // event
        route.forEach(item => item.utils.event.reload());
        TranxUtil.state.clear();
        TranxUtil.refer.clear();
        TranxUtil.child.clear();
        TranxUtil.route.clear();
    }

    /**
     * 1. avoid middle status machine
     * 2. yield garbage collection
     * 3. controll the process
     */
    private static end() {
        const event = new Map(TranxUtil.event);
        const tasks = TranxUtil.tasks;
        TranxUtil.event.clear();
        TranxUtil.tasks = [];
        tasks.forEach(task => task());
        event.forEach((item, model) => {
            model.utils.event.current.onChange(new Event(item))
        });
    }
}