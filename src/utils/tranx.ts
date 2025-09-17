import { Method, IType } from "../types";
import { Util } from ".";
import { Model } from "../model";
import { Event, MutateEvent } from "../types/event";
import { DebugUtil, LogLevel } from "./debug";

export class TranxUtil {
    private constructor() {}

    private static _isLock = false;
    public static get isLock() { return TranxUtil._isLock; }

    private static readonly state: Map<Model, Model['state']> = new Map();
    private static readonly refer: Map<Model, Model['refer']> = new Map();
    private static readonly child: Map<Model, Model['child']> = new Map();
    private static readonly route: Map<Model, Model['route']> = new Map();
    private static tasks: Method<void, []>[] = [];

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
                    if (!TranxUtil._isLock) return handler.call(this, ...args);
                    else TranxUtil.tasks.push(() => handler.call(this, ...args));
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

    public static span(): (prototype: Object, key: string, descriptor: TypedPropertyDescriptor<Method>) => TypedPropertyDescriptor<Method>;
    public static span(isType: true): (constructor: IType<Model>) => any;
    public static span(isType?: boolean) {
        if (isType) {
            return function (type: IType<Model>) {
                return class Model extends type {
                    constructor(...args: any[]) {
                        if (TranxUtil._isLock) {
                            super(...args);
                            TranxUtil.route.set(this, this.route);
                        }
                        else {
                            // console.group('Transaction');
                            TranxUtil._isLock = true;
                            super(...args);
                            TranxUtil.route.set(this, this.route);
                            TranxUtil.reload();
                            TranxUtil._isLock = false;
                            // console.groupEnd();
                            TranxUtil.end();
                        }
                    }
                };
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
                        if (isStateChange && !TranxUtil.state.has(model)) TranxUtil.state.set(model, model.state);
                        if (isReferChange && !TranxUtil.refer.has(model)) TranxUtil.refer.set(model, model.refer);
                        if (isChildChange && !TranxUtil.child.has(model)) TranxUtil.child.set(model, model.child);
                        if (isRouteChange && !TranxUtil.route.has(model)) TranxUtil.route.set(model, model.route);
                    }
                    if (TranxUtil._isLock) {
                        return handler.call(this, ...args);
                    } else {
                        // console.group('Transaction::', key);
                        TranxUtil._isLock = true;
                        const result = handler.call(this, ...args);
                        TranxUtil.reload();
                        TranxUtil._isLock = false;
                        TranxUtil.end();
                        // console.groupEnd();
                        return result;
                    }
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        }
    }

    private static reload() {
        // route 
        let route = new Map(TranxUtil.route);
        route.forEach((info, item) => item.utils.route.update());
        // child
        let child = new Map(TranxUtil.child);
        child.forEach((info, item) => item.utils.child.update());
        // refer
        let refer = new Map(TranxUtil.refer);
        route.forEach((info, item) => item.utils.refer.reload());
        refer.forEach((info, item) => item.utils.refer.reload());
        refer = new Map(TranxUtil.refer);
        refer.forEach((info, item) => item.utils.refer.update());
        // event
        route.forEach((info, item) => item.utils.event.reload());
        // decor
        let state = new Map(TranxUtil.state);
        let loop = 0;
        route.forEach((info, item) => item.utils.state.reload());
        state.forEach((info, item) => item.utils.state.reload());
        state = new Map(TranxUtil.state);
        route.forEach((info, item) => item.utils.state.update());
        state.forEach((info, item) => item.utils.state.update());
    }

    /**
     * 1. avoid middle status machine
     * 2. yield garbage collection
     * 3. controll the process
     */
    private static end() {
        const state = new Map(TranxUtil.state);
        const refer = new Map(TranxUtil.refer);
        const child = new Map(TranxUtil.child);
        const route = new Map(TranxUtil.route);
        const tasks = TranxUtil.tasks;
        TranxUtil.state.clear();
        TranxUtil.refer.clear();
        TranxUtil.child.clear();
        TranxUtil.route.clear();
        TranxUtil.tasks = [];
        state.forEach((info, model) => model.utils.event.current.onStateChange(new MutateEvent(info, model.state)));
        refer.forEach((info, model) => model.utils.event.current.onReferChange(new MutateEvent(info, model.refer)));
        child.forEach((info, model) => model.utils.event.current.onChildChange(new MutateEvent(info, model.child)));
        route.forEach((info, model) => model.utils.event.current.onRouteChange(new MutateEvent(info, model.route)));
        tasks.forEach(task => task());
    }
}