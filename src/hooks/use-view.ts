import { Model } from "../model";
import { modelResolver } from "../utils/model-resolver";
import { Constructor } from "../types";
import { blinkManager } from "../utils/blink-manager";

/**
 * Create a class decorator for view models.
 *
 * View construction is wrapped with `BlinkManager`, then the instance is queued
 * in `ModelResolver` for the same initialization lifecycle as models.
 *
 * @returns Class decorator for view model classes.
 */
export function useView<T extends Model>() {
    return function(ViewCtor: Constructor<Model>): Constructor<T> {
        const Wrapped = blinkManager.delegate(ViewCtor);
        return {
            [Wrapped.name]: class extends Wrapped {
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
        }[Wrapped.name] as any
    }
}
