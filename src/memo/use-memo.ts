import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { memoManager } from "../dep/dep-consumer-manager";
import { depCollector } from "../dep/dep-collector";
import { memoDelegator } from "./memo-delegator";
import { useDep } from "../dep/use-dep";
import { memoRegistry } from "./memo-registry";
import { tagRegistry } from "../tag/tag-registry";
    
export function useMemo() {
    return function(
        prototype: Model,
        key: string,
        descriptor: PropertyDescriptor
    ) {
        memoRegistry.register(prototype, key);
        const getter = descriptor.get;
        if (!getter) return;
        descriptor.get = function(this: Model) {
            const consumerTag = tagRegistry.query(this, key);
            if (memoDelegator.check(consumerTag)) {
                return memoDelegator.query(consumerTag);
            }
            depCollector.init(consumerTag);
            const value = getter.call(this);
            memoManager.collect(consumerTag);
            memoDelegator.update(consumerTag, value);
            return value;
        }
        useDep()(prototype, key, descriptor)
    }
}

