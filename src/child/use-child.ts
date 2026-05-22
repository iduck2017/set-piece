import { depRegistry } from "../dep/dep-registry";
import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { tagDelegator } from "../tag/tag-delegator";
import { ChildDelegator } from "./child-delegator";
import { childRegistry } from "./child-registry";

export type ChildList = Array<Model | undefined>

export function childIterator(model: Record<string, any>, key: string) {
    const result: Model[] = [];
    const value = model[key]
    if (value instanceof Model) result.push(model[key]);
    if (value instanceof Array)
        value.filter((item: any) => item instanceof Model)
            .forEach((item: any) => result.push(item));
    return result;
}

export function useChild<
    M extends Model & Record<string, any>,
    K extends string
>():
    M[K] extends Model | undefined ? 
        TypedPropertyDecorator<M, K> :
        M[K] extends ChildList | undefined ? 
            TypedPropertyDecorator<M, K> :
            TypedPropertyDecorator<never, never> {
    return function(prototype: M, key: K) {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        const getter = descriptor?.get;
        const setter = descriptor?.set;
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                if (getter) return getter.call(this);
                return tagDelegator.get(this, key);
            },
            set(this: Model, value) {
                const prev: unknown = Reflect.get(this, key)
                const next: unknown = new ChildDelegator(value, this).value;

                if (setter) setter.call(this, next);
                else tagDelegator.set(this, key, next);
                
                if (prev instanceof Model) prev._internal.unmount();
                if (prev instanceof Array) 
                    prev.filter(item => item instanceof Model)
                        .forEach(item => item._internal.unmount());
                if (next instanceof Model) next._internal.mount(this);
                if (next instanceof Array) 
                    next.filter(item => item instanceof Model)
                        .forEach(item => item._internal.mount(this));
            },
            enumerable: true,
            configurable: true,
        });

        childRegistry.register(prototype, key, childIterator);
        depRegistry.register(prototype, key)
    }
}
