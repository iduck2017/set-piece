import { depRegistry } from "../dep/dep-registry";
import { Model } from "../model";

/**
 * Create a property decorator for plain reactive state.
 *
 * This is a lighter alias around dependency registration. It does not add
 * producer behavior such as event, frame, or decor emission.
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
    }
}
