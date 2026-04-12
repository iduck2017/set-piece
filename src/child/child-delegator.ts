import { Model } from "../model";
import { useMacroTask } from "../task/use-macro-task";

function useLock<P extends any[], R = any>() {
    return function(
        prototype: unknown,
        key: unknown,
        descriptor: TypedPropertyDescriptor<(...args: P) => R>
    ) {
        const method = descriptor.value;
        if (!method) return;
        descriptor.value = function(this: ChildDelegator, ...args: P) {
            this.isLocked = true;
            const result = method.apply(this, args);
            this.isLocked = false;
            return result;
        }
        useMacroTask()(prototype, key, descriptor)
    }
}

export class ChildDelegator {
    public readonly value: unknown;
    
    private _isLocked = false;
    public set isLocked(value: boolean) {
        this._isLocked = value;
    }

    @useLock()
    private pop(origin: Model[]) {
        const result = origin.pop();
        if (result) result._internal.unmount();
        return result;
    }

    @useLock()
    private push(origin: Model[], ...next: Model[]) {
        console.warn('Child push', next)
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
