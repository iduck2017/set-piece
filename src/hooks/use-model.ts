import { modelResolver } from "../utils/model-resolver";
import { Model } from "../model";
import { storeRegistry } from "../store/store-registry";
import { Constructor } from "../types";
import { blinkManager } from "../utils/blink-manager";

/**
 * Create a class decorator for registered model types.
 *
 * The code is stored in `StoreRegistry`. Constructed instances are wrapped by
 * `BlinkManager` and queued in `ModelResolver` so initialization happens inside
 * the blink lifecycle.
 *
 * @param code - Stable persistence/type code for the model constructor.
 * @returns Class decorator for model classes.
 */
export function useModel(code: string) {
    return function(ModelCtor: Constructor<Model, undefined[]>): any {
        const Wrapped = class extends ModelCtor {
            /**
             * Construct the model and queue it for blink-time initialization.
             *
             * @param params - Constructor parameters forwarded to the model.
             */
            constructor(...params: any[]) {
                super(...params);
                modelResolver.register(this);
            }
        };
        const Delegated = blinkManager.delegate(Wrapped);
        storeRegistry.register(code, Delegated);
        return Delegated;
    }
}
