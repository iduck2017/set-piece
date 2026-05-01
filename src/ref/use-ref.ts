import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { weakRefResolver } from "./weak-ref-resolver";
import { weakRefManager } from "./weak-ref-manager";
import { useDep } from "../dep/use-dep";
import { weakRefRegistry } from "./weak-ref-registry";
import { tagDelegator } from "../tag/tag-delegator";

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
    return function(
        prototype: M,
        key: K,
    ) {
        useDep()(prototype, key)
    }
}

