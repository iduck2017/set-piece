import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { fieldRegistry } from "../utils/field-registry";
import { fieldDelegator } from "../utils/field-delegator";
import { weakRefFieldResolver } from "./weak-ref-field-resolver";
import { weakRefSourceManager } from "./weak-ref-source-manager";
import { useCustomWeakRef } from "./use-custom-weak-ref";
import { useDep } from "../dep/use-dep";

export type WeakRefList = Array<Model | undefined>
export function useWeakRef<
    M extends Model & Record<string, any>,
    K extends string
>():
    undefined extends M[K] ?
        M[K] extends Model | undefined ?
            TypedPropertyDecorator<M, K> :
            M[K] extends WeakRefList | undefined ?
                TypedPropertyDecorator<M, K> :
                TypedPropertyDecorator<never, never> :
        TypedPropertyDecorator<never, never> {
    return function(
        prototype: M,
        key: K,
    ) {
        useDep()(prototype, key)
        useCustomWeakRef<M, K>((refSource, key, refTarget) => {
            if (!refSource || !refTarget) return;
            if (refSource.root === refTarget.root) return;
            const value = Reflect.get(refSource, key);
            if (value instanceof Array) {
                const refTargets = value;
                const index = value.indexOf(refTarget);
                if (index === -1) return;
                refTargets.splice(index, 1);
            } 
            else Reflect.set(refSource, key, undefined);
        })(prototype, key);

        const [getter, setter] = fieldDelegator.access(prototype, key);
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                return getter.call(this);
            },
            set(this: Model, value) {
                const prev: unknown = getter.call(this);
                setter.call(this, value);
                const next: unknown = getter.call(this);
                if (prev instanceof Array) {
                    prev.filter(item => item instanceof Model)
                        .forEach(item => {
                            weakRefSourceManager.unbind(this, key, [item])
                        });
                }
                if (prev instanceof Model) weakRefSourceManager.unbind(this, key, [prev]);
                if (next instanceof Array) {
                    next.filter(item => item instanceof Model)
                        .forEach(item => {
                            weakRefSourceManager.bind(this, key, [item]);
                            weakRefFieldResolver.register(fieldRegistry.query(this, key));
                        });
                }
                if (next instanceof Model) {
                    weakRefSourceManager.bind(this, key, [next]);
                    weakRefFieldResolver.register(fieldRegistry.query(this, key));
                }
            },
            enumerable: true,
            configurable: true,
        });
    }
}

