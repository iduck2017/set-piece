import { Model } from "../model";
import { AbstractConstructor } from "../types";
import { depCollector } from "./dep-collector";
import { DepDelegator } from "./dep-delegator";
import { depService } from "./dep-service";
import { tagDelegator } from "../tag/tag-delegator";
import { tagRegistry } from "../tag/tag-registry";

class DepRegistry {
    private _config: Map<AbstractConstructor<Model>, string[]> = new Map();

    public register(prototype: Model, key: string, descriptor?: TypedPropertyDescriptor<any>) {
        const constructor: any = prototype.constructor;
        const keys = this._config.get(constructor) ?? [];
        keys.push(key);
        this._config.set(constructor, keys);

        if (!descriptor) {
            const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
            const getter = descriptor?.get;
            const setter = descriptor?.set;
            Object.defineProperty(prototype, key, {
                get(this: any) {
                    const tag = tagRegistry.query(this, key);
                    depCollector.collect(tag);
                    if (getter) return getter.call(this);
                    else return tagDelegator.get(this, key);
                },
                set(this: any, value) {
                    const tag = tagRegistry.query(this, key);
                    const prev = Reflect.get(this, key);
                    const next = new DepDelegator(value, tag).value;
                    if (setter) setter.call(this, next);
                    else tagDelegator.set(this, key, next);
                    if (prev !== next) {
                        depService.register(tag);
                    }
                },
                enumerable: true,
                configurable: true,
            });
        } else {
            const getter = descriptor.get;
            if (!getter) return;
            descriptor.get = function(this: any) {
                const tag = tagRegistry.query(this, key);
                depCollector.collect(tag);
                return getter.call(this);
            }
        }
    }
}
export const depRegistry = new DepRegistry();

export function useDep<
    M extends Record<string, any> & Model,
    K extends string
>() {
    return function(
        prototype: M,
        key: K,
        descriptor?: TypedPropertyDescriptor<M[K]>
    ) {
        depRegistry.register(prototype, key, descriptor);
    }
}
