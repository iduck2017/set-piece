import { modelResolver } from "../utils/model-resolver";
import { Model } from "../model";
import { Constructor } from "../types";
import { blinkManager } from "../utils/blink-manager";

/**
 * Create a class decorator for model initialization.
 *
 * Model construction and registration share one `BlinkManager` boundary,
 * so initialization runs after the full construction chain has registered.
 *
 * @returns Class decorator for model classes.
 */
export function useModel() {
    return function<T extends Constructor<Model>>(ModelCtor: T): T {
        const Wrapper = {
            [ModelCtor.name]: class extends ModelCtor {
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
        }[ModelCtor.name] as Constructor<Model>;
        return blinkManager.delegate(Wrapper) as T;
    }
}
