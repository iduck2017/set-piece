import { Model } from "../model";
import { AbstractConstructor } from "../types";
import { depRegistry } from "../dep/dep-registry";
import { depCollector } from "../dep/dep-collector";
import { memoManager } from "../dep/dep-consumer-manager";
import { tagRegistry } from "../tag/tag-registry";
import { memoDelegator } from "./memo-delegator";

class MemoRegistry {
    private _config: Map<AbstractConstructor<Model>, string[]> = new Map();

    public register(prototype: Model, key: string, descriptor?: PropertyDescriptor) {
        const type: any = prototype.constructor;
        const keys = this._config.get(type) ?? [];
        keys.push(key);
        this._config.set(type, keys);

        if (!descriptor) return;
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
        depRegistry.register(prototype, key, descriptor);
    }

    public query(prototype: Model): string[] {
        let constructor: any = prototype.constructor;
        const result: string[] = [];
        while (constructor) {
            const keys = this._config.get(constructor) ?? [];
            keys.forEach(key => {
                if (result.includes(key)) return;
                result.push(key);
            })
            constructor = Object.getPrototypeOf(constructor);
        }
        return result;
    }
}
export const memoRegistry = new MemoRegistry();

export function useMemo() {
    return function(
        prototype: Model,
        key: string,
        descriptor: PropertyDescriptor
    ) {
        memoRegistry.register(prototype, key, descriptor);
    }
}
