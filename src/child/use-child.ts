import { useDep } from "../dep/use-dep";
import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { fieldDelegator } from "../utils/field-delegator";
import { ChildDelegator } from "./child-delegator";
import { useCustomChild } from "./use-custom-child";

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
        useDep()(prototype, key)
        useCustomChild((model, key) => {
            const result: Model[] = [];
            const value = model[key]
            if (value instanceof Array) {
                value.filter((item: any) => item instanceof Model)
                    .forEach((item: any) => result.push(item));
            }
            if (value instanceof Model) result.push(model[key]);
            return result;
        })(prototype, key);

        const [getter, setter] = fieldDelegator.access(prototype, key);
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                return getter.call(this);
            },
            set(this: Model, value) {
                const prev: unknown = getter.call(this);
                const next: unknown = new ChildDelegator(value, this).value;
                setter.call(this, next);
                if (prev instanceof Array) {
                    prev.filter(item => item instanceof Model)
                        .forEach(item => item._internal.unmount());
                }
                else if (prev instanceof Model) prev._internal.unmount();
                if (next instanceof Array) {
                    next.filter(item => item instanceof Model)
                        .forEach(item => item._internal.mount(this));
                }
                else if (next instanceof Model) next._internal.mount(this);
            },
            enumerable: true,
            configurable: true,
        });
    }
}
