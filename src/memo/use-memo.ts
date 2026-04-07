import { depManager } from "../dep/dep-manager";
import { Model } from "../model";
import { memoManager } from "./memo-manager";
import { memoRegistry } from "./memo-registry";
import { Field, fieldRegistry } from "../utils/field-registry";
import { depCollector } from "../dep/dep-collector";
import { memoDelegator } from "./memo-delegator";
import { useDep } from "../dep/use-dep";
    
export function useMemo() {
    return function(
        prototype: Model,
        key: string,
        descriptor: PropertyDescriptor
    ) {
        useDep()(prototype, key)

        memoRegistry.register(prototype, key);
        const getter = descriptor.get;
        if (!getter) return;
        descriptor.get = function(this: Model) {
            const memoField = fieldRegistry.query(this, key);
            if (memoDelegator.check(memoField)) {
                return memoDelegator.query(memoField);
            }
            // console.log('Miss memo', this.name, key);
            depCollector.init(memoField);
            const value = getter.call(this);
            const deps = depCollector.query(memoField);
            deps.forEach(dep => {
                memoManager.bind(dep, memoField);
                depManager.bind(memoField, dep);
            })
            memoDelegator.update(memoField, value);
            depCollector.clear(memoField);
            return value;
        }
    }
}

