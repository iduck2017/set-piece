import { modelResolver } from "../model-resolver";
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
    return function(Constructor: Constructor<Model, undefined[]>): any {
        storeRegistry.register(code, Constructor);
        Constructor = blinkManager.delegate(Constructor);
        return class extends Constructor {
            /**
             * Construct the model and queue it for blink-time initialization.
             *
             * @param params - Constructor parameters forwarded to the model.
             */
            constructor(...params: any[]) {
                super(...params);
                modelResolver.register(this);
            }
        }
    }
}
