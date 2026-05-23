import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { depRegistry } from "../dep/dep-registry";
import { tagDelegator } from "../tag/tag-delegator";
import { tagRegistry } from "../tag/tag-registry";
import { RefDelegator } from "./ref-delegator";
import { refConsumerRegistry } from "./ref-consumer-registry";
import { refRegistry } from "./ref-registry";

export type RefList = Array<Model | undefined>
export function useRef<
    M extends Model & Record<string, any>,
    K extends string
>():
    undefined extends M[K] ?
        M[K] extends Model | undefined ?
            TypedPropertyDecorator<M, K> :
            M[K] extends RefList | undefined ?
                TypedPropertyDecorator<M, K> :
                TypedPropertyDecorator<never, never> :
    TypedPropertyDecorator<never, never>  {
    return function(prototype: M, key: K) {
        refRegistry.register(prototype, key);
        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        const getter = descriptor?.get;
        const setter = descriptor?.set;
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                if (getter) return getter.call(this);
                return tagDelegator.get(this, key);
            },
            set(this: Model, value: unknown) {
                const tag = tagRegistry.query(this, key);
                const prev: unknown = Reflect.get(this, key);
                const next: unknown = new RefDelegator(value, tag).value;
                if (setter) setter.call(this, next);
                else tagDelegator.set(this, key, next);

                if (prev instanceof Model) refConsumerRegistry.remove(prev, tag);
                if (next instanceof Model) refConsumerRegistry.add(next, tag);
                if (prev instanceof Array) prev.forEach((item: unknown) => {
                    if (item instanceof Model) refConsumerRegistry.remove(item, tag);
                });
                if (next instanceof Array) next.forEach((item: unknown) => {
                    if (item instanceof Model) refConsumerRegistry.add(item, tag);
                });
            },
            enumerable: true,
            configurable: true,
        });
        depRegistry.register(prototype, key);
    }
}
