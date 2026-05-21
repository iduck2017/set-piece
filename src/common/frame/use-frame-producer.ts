import { ChangeFrame } from ".";
import { Model } from "../../model";
import { Constructor } from "../../types";
import { tagDelegator } from "../tag/tag-delegator";
import { tagRegistry } from "../tag/tag-registry";
import { frameProducerResolver } from "./frame-producer-resolver";

export function useFrameProducer<
    M extends Model & Record<string, any>,
    K extends string,
>(loader: () => Constructor<ChangeFrame<M[K]>, [{ prev: M[K]; next: M[K] }]>) {
    return function(
        prototype: M,
        key: K,
    ) {
        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                if (descriptor?.get) return descriptor.get.call(this);
                return tagDelegator.get(this, key);
            },
            set(this: Model, value: M[K]) {
                const prev = descriptor?.get
                    ? descriptor.get.call(this)
                    : tagDelegator.get(this, key);
                if (descriptor?.set) descriptor.set.call(this, value);
                else tagDelegator.set(this, key, value);
                if (prev === value) return;
                const tag = tagRegistry.query(this, key);
                frameProducerResolver.register(tag, prev, loader());
            },
            enumerable: true,
            configurable: true,
        });
    }
}
