import { Model } from "../model"
import { TypedPropertyDecorator } from "../types"
import { getDescriptor } from "../utils/get-descriptor";
import { useCustomChild } from "./use-custom-child"

export function useChildList<
    M extends Model & Record<string, any>,
    K extends string
>(): 
    M[K] extends Array<Model | undefined> | undefined ? 
    TypedPropertyDecorator<M, K> :
    TypedPropertyDecorator<never, never> {
    return function(
        prototype: M,
        key: K,
    ) {
        useCustomChild((model: Model & Record<string, unknown>, key: string) => {
            const value = model[key];
            const result: Model[] = [];
            if (value instanceof Array) {
                value.forEach(item => {
                    if (item instanceof Model) result.push(item);
                });
            }
            return result;
        })(prototype, key);
        const { setter, getter } = getDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get() {
                const value = getter.call(this);
                return delegateChildList(value, this);
            },
            set(this: Model, value) {
                const prev: unknown = Reflect.get(this, key);
                setter.call(this, value);
                const next: unknown = Reflect.get(this, key);
                if (prev instanceof Array) {
                    prev.forEach(item => {
                        if (item instanceof Model) item._internal.unmount();
                    });
                }
                if (next instanceof Array) {
                    next.forEach(item => {
                        if (item instanceof Model) item._internal.mount(this);
                    });
                }
            },
            enumerable: true,
            configurable: true,
        });
    }
}   

export function delegateChildList(value: unknown, parent: Model) {
    function pop(origin: Model[]) {
        const result = origin.pop();
        if (result) result._internal.unmount();
        return result;
    }

    function push(origin: Model[], ...next: Model[]) {
        next.forEach(item => item._internal.mount(parent));
        return origin.push(...next);
    }

    function shift(origin: Model[]) {
        const result = origin.shift();
        if (result) result._internal.unmount();
        return result;
    }

    function unshift(origin: Model[], ...next: Model[]) {
        next.forEach(item => item._internal.mount(parent));
        return origin.unshift(...next);
    }

    function splice(origin: Model[], start: number, count: number, ...next: Model[]) {
        const prev = origin.slice(start, start + count);
        prev.forEach(item => item._internal.unmount());
        next.forEach(item => item._internal.mount(parent));
        return origin.splice(start, count, ...next);
    }

    function fill(origin: Model[]) {
        console.warn('Fill is not supported for child list');
        return origin;
    }
    
    if (value instanceof Array) {
        return new Proxy(value, {
            get: (origin, index) => {
                if (index === 'pop') return pop.bind(undefined, origin);
                if (index === 'push') return push.bind(undefined, origin);
                if (index === 'fill') return fill.bind(undefined, origin);
                if (index === 'shift') return shift.bind(undefined, origin);
                if (index === 'unshift') return unshift.bind(undefined, origin);
                if (index === 'splice') return splice.bind(undefined, origin);
                return Reflect.get(origin, index);
            },
            set: (origin, index, next) => {
                const prev = Reflect.get(origin, index);
                if (prev instanceof Model) prev._internal.unmount();
                if (next instanceof Model) next._internal.mount(parent);
                Reflect.set(origin, index, next);
                return true;
            },
            deleteProperty: (origin, index) => {
                const prev = Reflect.get(origin, index);
                if (prev instanceof Model) prev._internal.unmount();
                Reflect.deleteProperty(origin, index);
                return true;
            }
        })
    }
    return value;
}