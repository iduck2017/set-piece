import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";

export function useRefList<
    M extends Model & Record<string, any>,
    K extends string
>(): 
    M[K] extends Array<Model | undefined> | undefined ? 
        undefined extends M[K] ? 
        TypedPropertyDecorator<M, K> :
        TypedPropertyDecorator<never, never> :
        TypedPropertyDecorator<never, never> {
    return function(
        prototype: M,
        key: K,
    ) {

    }
}