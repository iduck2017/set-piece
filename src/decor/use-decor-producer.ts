import { Model } from "../model";
import { tagDelegator } from "../tag/tag-delegator";
import { tagRegistry } from "../tag/tag-registry";
import { decorProducerDelegator } from "./decor-producer-delegator";
import { DecorProducerLoader, decorProducerRegistry } from "./decor-producer-registry";
import { decorProducerResolver } from "./decor-producer-resolver";
import { decorService } from "./decor-service";

export function useDecorProducer<
    M extends Model & Record<string, any>,
    K extends string,
>(loader: DecorProducerLoader<M[K]>) {
    return function(
        prototype: M,
        key: K,
    ) {
        decorProducerRegistry.register(prototype, key, loader)
        const descriptor = Object.getOwnPropertyDescriptor(prototype, key);
        const getter = descriptor?.get;
        const setter = descriptor?.set;
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                const depConsumerTag = tagRegistry.query(this, key)
                let origin;
                if (getter) origin = getter.call(this);
                else origin = tagDelegator.get(this, key);
                if (decorProducerDelegator.check(depConsumerTag)) {
                    return decorProducerDelegator.query(depConsumerTag)
                }
                const decorConstructors = loader()
                const decor = new decorConstructors(origin, this);
                decorService.emit(this, decor);
                decorProducerDelegator.update(depConsumerTag, decor.result);
                return decor.result;
            },
            set(this: Model, value) {
                const decorProducerTag = tagRegistry.query(this, key)
                if (setter) setter.call(this, value);
                else tagDelegator.set(this, key, value);
                decorProducerResolver.register(decorProducerTag);
            },
            enumerable: true,
            configurable: true,
        });
    }
}
