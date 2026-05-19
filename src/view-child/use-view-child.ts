import { View } from "../view";
import { TypedPropertyDecorator } from "../types";
import { ViewChildDelegator } from "./view-child-delegator";
import { viewChildRegistry } from "./view-child-registry";
import { viewStorage } from "./view-storage";

export type ViewChildList = Array<View | undefined>
export function useViewChild<
    V extends View & Record<string, any>,
    K extends string
>():
    V[K] extends View | undefined ?
        TypedPropertyDecorator<V, K> :
        V[K] extends ViewChildList | undefined ?
            TypedPropertyDecorator<V, K> :
            TypedPropertyDecorator<never, never> {
    return function(
        prototype: V,
        key: K,
    ) {
        viewChildRegistry.register(prototype, key, (view, key) => {
            const result: View[] = [];
            const value = view[key]
            if (value instanceof Array) {
                value.filter((item: any) => item instanceof View)
                    .forEach((item: any) => result.push(item));
            }
            if (value instanceof View) result.push(view[key]);
            return result;
        })

        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get(this: View) {
                if (descriptor?.get) return descriptor.get.call(this);
                else return viewStorage.get(this, key);
            },
            set(this: View, value) {
                const prev: unknown = Reflect.get(this, key)
                const next: unknown = new ViewChildDelegator(value, this).value;
                if (descriptor?.set) descriptor.set.call(this, next);
                else viewStorage.set(this, key, next);
                if (prev instanceof Array) {
                    prev.filter(item => item instanceof View)
                        .forEach(item => item._internal.unmount());
                }
                if (prev instanceof View) prev._internal.unmount();
                if (next instanceof Array) {
                    next.filter(item => item instanceof View)
                        .forEach(item => item._internal.mount(this));
                }
                if (next instanceof View) next._internal.mount(this);
            },
            enumerable: true,
            configurable: true,
        });
    }
}
