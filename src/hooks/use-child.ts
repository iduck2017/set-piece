import { depRegistry } from "../dep/dep-registry";
import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { tagDelegator } from "../tag/tag-delegator";
import { ChildDelegator } from "../child/child-delegator";
import { childRegistry } from "../child/child-registry";

export type ChildList = Array<Model | undefined>

/**
 * Read a decorated child property as a normalized model list.
 *
 * `ChildRegistry` calls this when `Model.children` or `Model.descendants` is
 * queried.
 *
 * @param model - Model instance that owns the child property.
 * @param key - Decorated child property key.
 * @returns Child models found in the property value.
 */
function iterator(model: Record<string, any>, key: string) {
    const children: Model[] = [];
    const value = model[key]
    if (value instanceof Model) children.push(model[key]);
    if (value instanceof Array) value
        .filter((item: any) => item instanceof Model)
        .forEach((item: any) => children.push(item));
    return children;
}

/**
 * Create a property decorator for owned child model state.
 *
 * Use this on a property that stores one child model or a child model array.
 * Assignments and array mutations mount new children to the owner and unmount
 * removed children. The property is also registered as reactive dependency
 * state. StoreService uses the child registry for recursive persistence.
 *
 * @returns Property decorator for child model properties.
 */
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
                if (prev instanceof Array) prev
                    .filter(item => item instanceof Model)
                    .forEach(item => item._internal.unmount());
                if (next instanceof Model) next._internal.mount(this);
                if (next instanceof Array) next
                    .filter(item => item instanceof Model)
                    .forEach(item => item._internal.mount(this));
            },
            enumerable: true,
            configurable: true,
        });

        childRegistry.register(prototype, key, iterator);
        depRegistry.register(prototype, key)
    }
}
