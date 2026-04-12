import { useDep } from "../dep/use-dep";
import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { tagDelegator } from "../tag/tag-delegator";
import { ChildDelegator } from "./child-delegator";
import { childRegistry } from "./child-registry";

export type ChildList = Array<Model | undefined>
export function useChild<
    M extends Model & Record<string, any>,
    K extends string
>():
    M[K] extends Model | undefined ? 
        TypedPropertyDecorator<M, K> :
        M[K] extends ChildList | undefined ? 
            TypedPropertyDecorator<M, K> :
            TypedPropertyDecorator<never, never> {
    return function(
        prototype: M,
        key: K,
    ) {
        childRegistry.register(prototype, key, (model, key) => {
            const result: Model[] = [];
            const value = model[key]
            if (value instanceof Array) {
                value.filter((item: any) => item instanceof Model)
                    .forEach((item: any) => result.push(item));
            }
            if (value instanceof Model) result.push(model[key]);
            return result;
        })

        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                if (descriptor?.get) return descriptor.get.call(this);
                else return tagDelegator.get(this, key);
            },
            set(this: Model, value) {
                const prev: unknown = Reflect.get(this, key)
                const next: unknown = new ChildDelegator(value, this).value;
                if (descriptor?.set) descriptor.set.call(this, next);
                else tagDelegator.set(this, key, next);
                if (prev instanceof Array) {
                    prev.filter(item => item instanceof Model)
                        .forEach(item => item._internal.unmount());
                }
                if (prev instanceof Model) prev._internal.unmount();
                if (next instanceof Array) {
                    next.filter(item => item instanceof Model)
                        .forEach(item => item._internal.mount(this));
                }
                if (next instanceof Model) next._internal.mount(this);
            },
            enumerable: true,
            configurable: true,
        });
        useDep()(prototype, key)

    }
}
