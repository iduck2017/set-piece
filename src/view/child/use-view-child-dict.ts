import { View } from "..";
import { TypedPropertyDecorator } from "../../types";
import { viewChildRegistry } from "./view-child-registry";
import { viewStorage } from "./view-storage";

export type ViewChildDict = Record<string, View | undefined>
export function useViewChildDict<
    V extends View & Record<string, any>,
    K extends string
>():
    V[K] extends ViewChildDict | undefined ?
        TypedPropertyDecorator<V, K> :
        TypedPropertyDecorator<never, never> {
    return function(prototype: V, key: K) {
        viewChildRegistry.register(prototype, key, (view, key) => {
            return Object.values(view[key]).filter(item => item instanceof View)
        });

        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get(this: View) {
                if (descriptor?.get) return descriptor.get.call(this);
                else return viewStorage.get(this, key);
            },
            set(this: View, value: ViewChildDict | undefined) {
                const prev: ViewChildDict | undefined = Reflect.get(this, key)
                const next = value ? new Proxy(value, {
                    set: (target, prop, next) => {
                        const prev = Reflect.get(target, prop);
                        Reflect.set(target, prop, next);
                        if (prev instanceof View) prev._internal.unmount();
                        if (next instanceof View) next._internal.mount(this);
                        return true;
                    },
                    deleteProperty: (target, prop) => {
                        const prev = Reflect.get(target, prop);
                        Reflect.deleteProperty(target, prop);
                        if (prev instanceof View) prev._internal.unmount();
                        return true;
                    }
                }) : undefined;

                if (descriptor?.set) descriptor.set.call(this, next);
                else viewStorage.set(this, key, next);

                Object.values(prev ?? {})
                    .filter(item => item instanceof View)
                    .forEach(item => item._internal.unmount());
                Object.values(next ?? {})
                    .filter(item => item instanceof View)
                    .forEach(item => item._internal.mount(this));
            },
            enumerable: true,
            configurable: true,
        });
    } as any;
}
