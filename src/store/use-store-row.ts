import { Model } from "../model";
import { storeRowRegistry } from "./store-row-registry";

export function useStoreRow<
    I extends Model & Record<string, any>,
    K extends string,
    R extends any
>(
    parser: (value: I[K]) => R,
    generator: (value: R) => I[K],
) {
    return function(
        prototype: I,
        key: K,
    ) {
        storeRowRegistry.register(prototype, key, parser, generator);
    }
}
