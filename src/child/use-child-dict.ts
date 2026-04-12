import { useDep } from "../dep/use-dep";
import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { tagDelegator } from "../tag/tag-delegator";
import { childRegistry } from "./child-registry";

export type ChildDict = Record<string, Model | undefined>
export function useChildDict<
    M extends Model & Record<string, any>,
    K extends string
>():
    M[K] extends ChildDict | undefined ?
        TypedPropertyDecorator<M, K> :
        TypedPropertyDecorator<never, never> {
    return function(prototype: M, key: K) {
        useDep()(prototype, key);
        childRegistry.register(prototype, key, (model, key) => {
            return Object.values(model[key]).filter(item => item instanceof Model)
        });

        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                if (descriptor?.get) return descriptor.get.call(this);
                else return tagDelegator.get(this, key);
            },
            set(this: Model, value: ChildDict | undefined) {
                const prev: ChildDict | undefined = Reflect.get(this, key)
                const next = value ? new Proxy(value, {
                    set: (target, prop, next) => {
                        const prev = Reflect.get(target, prop);
                        Reflect.set(target, prop, next);
                        if (prev instanceof Model) prev._internal.unmount();
                        if (next instanceof Model) next._internal.mount(this);
                        return true;
                    },
                    deleteProperty: (target, prop) => {
                        const prev = Reflect.get(target, prop);
                        Reflect.deleteProperty(target, prop);
                        if (prev instanceof Model) prev._internal.unmount();
                        return true;
                    }
                }) : undefined;

                if (descriptor?.set) descriptor.set.call(this, next);
                else tagDelegator.set(this, key, next);

                Object.values(prev ?? {})
                    .filter(item => item instanceof Model)
                    .forEach(item => item._internal.unmount());
                Object.values(next ?? {})
                    .filter(item => item instanceof Model)
                    .forEach(item => item._internal.mount(this));
            },
            enumerable: true,
            configurable: true,
        });
    } as any;
}
