import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { depRegistry } from "../dep/dep-registry";

export type RefList = Array<Model | undefined>
export function useRef<
    M extends Model & Record<string, any>,
    K extends string
>():
    M[K] extends Model | undefined ?
        TypedPropertyDecorator<M, K> :
        M[K] extends RefList | undefined ?
            TypedPropertyDecorator<M, K> :
            TypedPropertyDecorator<never, never> {
    return function(prototype: M, key: K) {
        depRegistry.register(prototype, key)
    }
}

