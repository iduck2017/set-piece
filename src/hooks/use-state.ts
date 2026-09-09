import { depRegistry } from "../dep/dep-registry";
import { Model } from "../model";
import { stateRegistry } from "../state/state-registry";

/**
 * Create a property decorator for plain reactive state.
 *
 * Registers reactive dependencies and stores the field value unchanged.
 * It does not add event, frame, or decor producer behavior.
 *
 * @returns Property decorator for reactive state fields.
 */
export function useState<
    M extends Model & Record<string, any>,
    K extends string,
>() {
    return function(
        prototype: M,
        key: K,
    ) {
        depRegistry.register(prototype, key);
        stateRegistry.register(prototype, key);
    }
}
