import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";

export function useRef<
    M extends Model & Record<string, any>,
    K extends string
>(): 
    M[K] extends Model | undefined ? 
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