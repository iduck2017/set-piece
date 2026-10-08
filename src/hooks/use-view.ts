import { Model } from "../model";
import { modelResolver } from "../utils/model-resolver";
import { Constructor } from "../types";
import { blinkManager } from "../utils/blink-manager";

/**
 * Create a class decorator for view models.
 *
 * View construction and model registration share one `BlinkManager` boundary,
 * so initialization runs after the full construction chain has registered.
 *
 * @returns Class decorator for view model classes.
 */
export function useView<T extends Model>() {
    return function(ViewCtor: Constructor<Model>): Constructor<T> {
        const Registered = {
            [ViewCtor.name]: class extends ViewCtor {
                /**
                 * Construct the view and queue it for blink-time initialization.
                 *
                 * @param params - Constructor parameters forwarded to the view.
                 */
                constructor(...params: any[]) {
                    super(...params);
                    modelResolver.register(this);
                }
            }
        }[ViewCtor.name] as Constructor<Model>;
        return blinkManager.delegate<T>(Registered);
    }
}
