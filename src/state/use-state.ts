import { Decor } from "../decor";
import { Model } from "../model";
import { Constructor } from "../types";
import { fieldDelegator } from "../utils/field-delegator";
import { fieldRegistry } from "../utils/field-registry";
import { stateDelegator } from "./state-delegator";
import { useDep } from "../dep/use-dep";
import { decorProducerRegistry } from "../decor/decor-producer-registry";
import { stateResolver } from "./state-resolver";
import { decorEmitter } from "../decor/decor-emitter";

export type DecorConfig<T = any> = () => Constructor<Decor<T>, [origin: T]>

export function useState<
    M extends Model & Record<string, any>,
    K extends string,
>(config?: DecorConfig<M[K]>) {
    return function(
        prototype: M,
        key: K,
    ) {
        useDep()(prototype, key)

        if (!config) return;
        decorProducerRegistry.register(prototype, key, config)
        const [getter, setter] = fieldDelegator.access(prototype, key);
        Object.defineProperty(prototype, key, {
            get(this: Model) {
                const decorProvider = fieldRegistry.query(this, key)
                const origin = getter.call(this);
                if (stateDelegator.check(decorProvider)) {
                    // Read from context
                    return stateDelegator.query(decorProvider)
                }
                const types = config()
                const decor = new types(origin);
                decorEmitter.emit(this, decor);
                console.log('Use decor', this.name, key, origin, decor.result);
                // Update context
                stateDelegator.update(decorProvider, decor.result);
                return decor.result;
            },
            set(this: Model, value) {
                const decorProducerField = fieldRegistry.query(this, key)
                setter.call(this, value);
                stateResolver.register(decorProducerField);
                stateResolver.resolve();
            },
            enumerable: true,
            configurable: true,
        });
    }
}
