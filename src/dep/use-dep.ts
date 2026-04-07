import { Model } from "../model";
import { fieldRegistry } from "../utils/field-registry";
import { fieldDelegator } from "../utils/field-delegator";
import { depRegistry } from "./dep-registry";
import { depCollector } from "./dep-collector";
import { DepDelegator } from "./dep-delegator";
import { depResolver } from "./dep-resolver";

export function useDep<
    M extends Record<string, any> & Model,
    K extends string
>() {
    return function(
        prototype: M,
        key: K,
        descriptor?: TypedPropertyDescriptor<M[K]>
    ) {
        depRegistry.register(prototype, key);
        if (!descriptor) {
            const [getter, setter] = fieldDelegator.access(prototype, key);
            Object.defineProperty(prototype, key, {
                get(this: Model) {
                    const dep = fieldRegistry.query(this, key);
                    depCollector.collect(dep);
                    return getter.call(this);
                },
                set(this: Model, value) {
                    const dep = fieldRegistry.query(this, key);
                    const prev = getter.call(this);
                    const next = new DepDelegator(value, dep).value;
                    setter.call(this, next);
                    if (prev !== next) depResolver.resolve(dep)
                },
                enumerable: true,
                configurable: true,
            });
        } else {
            const getter = descriptor.get;
            if (!getter) return;
            descriptor.get = function(this: Model) {
                const dep = fieldRegistry.query(this, key);
                depCollector.collect(dep)
                return getter.call(this);
            }
        }
    }
}
