import { depRegistry } from "../dep/dep-registry";
import { Model } from "../model";
import { refConsumerRegistry } from "../ref/ref-consumer-registry";
import { RefDelegator } from "../ref/ref-delegator";
import { refRegistry } from "../ref/ref-registry";
import { tagDelegator } from "../tag/tag-delegator";
import { tagRegistry } from "../tag/tag-registry";
import { TypedPropertyDecorator } from "../types";

export type RefList = Array<Model | undefined>

/**
 * Create a property decorator for external model references.
 *
 * Unlike `useChild`, referenced models are not mounted as children. Instead,
 * holder relationships are tracked so `Model.unlink()` can clear references to
 * a model when needed.
 *
 * @returns Property decorator for optional model refs or ref arrays.
 */
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
                if (prev instanceof Array)
                    prev.filter(item => item instanceof Model)
                        .forEach(item => refConsumerRegistry.remove(item, tag));
                if (next instanceof Model) refConsumerRegistry.add(next, tag);
                if (next instanceof Array)
                    next.filter(item => item instanceof Model)
                        .forEach(item => refConsumerRegistry.add(item, tag));
            },
            enumerable: true,
            configurable: true,
        });
        depRegistry.register(prototype, key);
    }
}
