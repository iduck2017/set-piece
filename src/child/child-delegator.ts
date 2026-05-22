import { useAction } from "../action/action-manager";
import { Model } from "../model";

function useLock<P extends any[], R = any>() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<(...args: P) => R>
    ) {
        const handler = descriptor.value;
        if (!handler) return;
        descriptor.value = function(this: ChildDelegator, ...args: P) {
            this.locked = true;
            const result = handler.apply(this, args);
            this.locked = false;
            return result;
        }
        useAction()(prototype, key, descriptor)
    }
}

export class ChildDelegator {
    public readonly value: unknown;
    
    protected _locked;
    public set locked(value: boolean) {
        this._locked = value;
    }

    @useLock()
    private pop(origin: Model[]) {
        const result = origin.pop();
        if (result) result._internal.unmount();
        return result;
    }

    @useLock()
    private push(origin: Model[], ...next: Model[]) {
        const result = origin.push(...next);
        next.forEach(item => item._internal.mount(this.parent));
        return result;
    }

    @useLock()
    private shift(origin: Model[]) {
        const result = origin.shift();
        if (result) result._internal.unmount();
        return result;
    }

    @useLock()
    private unshift(origin: Model[], ...next: Model[]) {
        const result = origin.unshift(...next);
        next.forEach(item => item._internal.mount(this.parent));
        return result;
    }

    @useLock()
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
                    if (index === 'pop') return this.pop.bind(this, origin);
                    if (index === 'push') return this.push.bind(this, origin);
                    if (index === 'fill') return this.fill.bind(this, origin);
                    if (index === 'shift') return this.shift.bind(this, origin);
                    if (index === 'unshift') return this.unshift.bind(this, origin);
                    if (index === 'splice') return this.splice.bind(this, origin);
                    return Reflect.get(origin, index)
                },
                set: (origin, index, next) => {
                    const prev = Reflect.get(origin, index);
                    Reflect.set(origin, index, next);
                    if (this._locked) return true;
                    if (prev instanceof Model) prev._internal.unmount();
                    if (next instanceof Model) next._internal.mount(this.parent);
                    return true;
                },
                deleteProperty: (origin, index) => {
                    const prev = Reflect.get(origin, index);
                    Reflect.deleteProperty(origin, index);
                    if (this._locked) return true;
                    if (prev instanceof Model) prev._internal.unmount();
                    return true;
                }
            });
        } 
        else this.value = value;
        this._locked = false;
    }
}
