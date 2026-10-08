import { Model } from "../model";
import { storeRegistry } from "../store/store-registry";
import { Constructor } from "../types";

/**
 * Register a model constructor under a stable persistence code.
 *
 * Place this above `useModel()` so the registry receives the wrapped constructor.
 * The constructor must support being called without arguments during loading.
 *
 * @param code - Stable persistence/type code for the model constructor.
 * @returns Class decorator that registers and returns the same constructor.
 */
export function useStore(code: string) {
    return function<T extends Constructor<Model, undefined[]>>(ModelCtor: T): T {
        storeRegistry.register(code, ModelCtor);
        return ModelCtor;
    }
}
