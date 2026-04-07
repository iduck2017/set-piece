import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { RefUnbinder, weakRefRegistry } from "./weak-ref-registry";

export function useCustomWeakRef<
    M extends Model & Record<string, any>,
    K extends string
>(unbinder: RefUnbinder): TypedPropertyDecorator<M, K> {
    return function(prototype: M, key: K) {
        weakRefRegistry.register(prototype, key, unbinder);
    }
}
