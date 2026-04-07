import { useDep } from "../dep/use-dep";
import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { fieldDelegator } from "../utils/field-delegator";
import { useCustomChild } from "./use-custom-child";

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
        useCustomChild((model, key) => {
            return Object.values(model[key]).filter(item => item instanceof Model)
        })(prototype, key);

        const [getter, setter] = fieldDelegator.access(prototype, key);
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                return getter.call(this);
            },
            set(this: Model, value: ChildDict | undefined) {
                const prev: ChildDict = getter.call(this) ?? {};
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
                setter.call(this, next);
                Object.values(prev)
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
