import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { weakRefResolver } from "./weak-ref-resolver";
import { weakRefManager } from "./weak-ref-manager";
import { depRegistry } from "../dep/dep-registry";
import { weakRefRegistry } from "./weak-ref-registry";
import { tagDelegator } from "../tag/tag-delegator";
import { RefList } from "./use-ref";

export function useWeakRef<
    M extends Model & Record<string, any>,
    K extends string
>():
    undefined extends M[K] ?
        M[K] extends Model | undefined ?
            TypedPropertyDecorator<M, K> :
            M[K] extends RefList | undefined ?
                TypedPropertyDecorator<M, K> :
                TypedPropertyDecorator<never, never> :
        TypedPropertyDecorator<never, never> {
    return function(
        prototype: M,
        key: K,
    ) {
        depRegistry.register(prototype, key)
        weakRefRegistry.register(prototype, key, (refSource, key, refTarget) => {
            if (!refSource || !refTarget) return;
            if (refSource.root === refTarget.root) return;
            const value = Reflect.get(refSource, key);
            if (value instanceof Array) {
                const refTargets = value;
                const index = value.indexOf(refTarget);
                if (index === -1) return;
                // console.log('WeakRef unbind', key)
                refTargets.splice(index, 1);
            }
            else {
                // console.log('WeakRef unbind', key)
                Reflect.set(refSource, key, undefined);
            }
        })

        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        const getter = descriptor?.get;
        const setter = descriptor?.set;
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                if (getter) return getter.call(this);
                return tagDelegator.get(this, key);
            },
            set(this: Model, value) {
                const prev: unknown = Reflect.get(this, key);
                if (setter) setter.call(this, value);
                else tagDelegator.set(this, key, value);
                const next: unknown = Reflect.get(this, key);
                if (prev instanceof Array) {
                    prev.filter(item => item instanceof Model)
                        .forEach(item => {
                            weakRefManager.unbind(this, key, [item])
                        });
                }
                if (prev instanceof Model) weakRefManager.unbind(this, key, [prev]);
                if (next instanceof Array) {
                    next.filter(item => item instanceof Model)
                        .forEach(item => {
                            weakRefManager.bind(this, key, [item]);
                            const weakRefTag = tagDelegator.get(this, key);
                            weakRefResolver.register(weakRefTag);
                        });
                }
                if (next instanceof Model) {
                    weakRefManager.bind(this, key, [next]);
                    const weakRefTag = tagDelegator.get(this, key);
                    weakRefResolver.register(weakRefTag);
                }
            },
            enumerable: true,
            configurable: true,
        });
        
    }
}

