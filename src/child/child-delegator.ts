import { Model } from "../model";

export class ChildDelegator {
    public readonly value: unknown;
    private _isLocked = false;

    private static useLock<P extends any[], R = any>() {
        return function(
            _prototype: unknown,
            _key: unknown,
            descriptor: TypedPropertyDescriptor<(...args: P) => R>
        ) {
            const method = descriptor.value;
            if (!method) return;
            descriptor.value = function(this: ChildDelegator, ...args: P) {
                this._isLocked = true;
                const result = method.apply(this, args);
                this._isLocked = false;
                return result;
            }
        }
    }

    @ChildDelegator.useLock()
    private pop(origin: Model[]) {
        const result = origin.pop();
        if (result) result._internal.unmount();
        return result;
    }

    @ChildDelegator.useLock()
    private push(origin: Model[], ...next: Model[]) {
        const result = origin.push(...next);
        next.forEach(item => item._internal.mount(this.parent));
        return result;
    }

    @ChildDelegator.useLock()
    private shift(origin: Model[]) {
        const result = origin.shift();
        if (result) result._internal.unmount();
        return result;
    }

    @ChildDelegator.useLock()
    private unshift(origin: Model[], ...next: Model[]) {
        const result = origin.unshift(...next);
        next.forEach(item => item._internal.mount(this.parent));
        return result;
    }

    @ChildDelegator.useLock()
    private splice(
        origin: Model[], 
        start: number, 
        count: number, 
        ...next: Model[]
    ) {
        const prev = origin.slice(start, start + count);
        const result = origin.splice(start, count, ...next);
        prev.forEach(item => item._internal.unmount());
        next.forEach(item => item._internal.mount(this.parent));
        return result;
    }

    private fill(origin: Model[]) { 
        return origin 
    }

    constructor(value: unknown, private readonly parent: Model) {
        if (value instanceof Array) {
            this.value = new Proxy(value, {
                get: (origin, index) => {
                    const value = Reflect.get(origin, index);
                    if (value === origin.pop) return this.pop.bind(this, origin);
                    if (value === origin.push) return this.push.bind(this, origin);
                    if (value === origin.fill) return this.fill.bind(this, origin);
                    if (value === origin.shift) return this.shift.bind(this, origin);
                    if (value === origin.unshift) return this.unshift.bind(this, origin);
                    if (value === origin.splice) return this.splice.bind(this, origin);
                    return value
                },
                set: (origin, index, next) => {
                    const prev = Reflect.get(origin, index);
                    Reflect.set(origin, index, next);
                    if (this._isLocked) return true;
                    if (prev instanceof Model) prev._internal.unmount();
                    if (next instanceof Model) next._internal.mount(this.parent);
                    return true;
                },
                deleteProperty: (origin, index) => {
                    const prev = Reflect.get(origin, index);
                    Reflect.deleteProperty(origin, index);
                    if (this._isLocked) return true;
                    if (prev instanceof Model) prev._internal.unmount();
                    return true;
                }
            });
        } else this.value = value;
    }
}
