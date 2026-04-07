import { Model } from "../model";
import { TypedPropertyDecorator } from "../types";
import { ChildIterator, childRegistry } from "./child-registry";

export function useCustomChild<
    M extends Model & Record<string, any>,
    K extends string
>(iterator: ChildIterator): TypedPropertyDecorator<M, K> {
    return function(prototype: M, key: K) {
        childRegistry.register(prototype, key, iterator);
    }
}
