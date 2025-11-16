import { Util } from ".";
import { Model } from "../model";
import { Frame } from "../types/model";
import { IClass, Method } from "../types";
import { Event } from "../types/event";

export class TranxUtil {
    private constructor() {}

    private static _locked = false;
    public static get locked() { return TranxUtil._locked; }

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
                    if (!TranxUtil._locked) return handler.call(this, ...args);
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
                            if (TranxUtil._locked) {
                                super(...args);
                                TranxUtil.add(this, TranxUtil.route)
                            }
                            else {
                                TranxUtil._locked = true;
                                super(...args);
                                TranxUtil.add(this, TranxUtil.route)
                                TranxUtil.reload();
                                TranxUtil._locked = false;
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
                        const stateChanged = model.utils.state === this;
                        const referChanged = model.utils.refer === this;
                        const childChanged = model.utils.child === this;
                        const routeChanged = model.utils.route === this;
                        if (stateChanged) TranxUtil.add(model, TranxUtil.state);
                        if (referChanged) TranxUtil.add(model, TranxUtil.refer);
                        if (childChanged) TranxUtil.add(model, TranxUtil.child);
                        if (routeChanged) TranxUtil.add(model, TranxUtil.route);
                    }
                    if (TranxUtil._locked) {
                        return handler.call(this, ...args);
                    } else {
                        TranxUtil._locked = true;
                        const result = handler.call(this, ...args);
                        TranxUtil.reload();
                        TranxUtil._locked = false;
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