import { Model } from "../model";
import { depRegistry } from "./dep-registry";
import { depCollector } from "./dep-collector";
import { DepDelegator } from "./dep-delegator";
import { tagDelegator } from "../tag/tag-delegator";
import { tagRegistry } from "../tag/tag-registry";
import { depService } from "./dep-service";
import { macroTaskManager } from "../task/macro-task-manager";

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
            const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
            Object.defineProperty(prototype, key, {
                get(this: Model) {
                    const tag = tagRegistry.query(this, key);
                    depCollector.collect(tag);
                    if (descriptor?.get) return descriptor.get.call(this);
                    else return tagDelegator.get(this, key);
                },
                set(this: Model, value) {
                    const tag = tagRegistry.query(this, key);
                    const prev = Reflect.get(this, key)
                    const next = new DepDelegator(value, tag).value;
                    if (descriptor?.set) descriptor.set.call(this, next);
                    else tagDelegator.set(this, key, next);
                    if (prev !== next) {
                        console.log(`Dep changed: ${tag.name} ${prev} ${next}`);
                        depService.register(tag)
                    }
                },
                enumerable: true,
                configurable: true,
            });
        } else {
            const getter = descriptor.get;
            if (!getter) return;
            descriptor.get = function(this: Model) {
                const tag = tagRegistry.query(this, key);
                depCollector.collect(tag);
                return getter.call(this);
            }
        }
    }
}
