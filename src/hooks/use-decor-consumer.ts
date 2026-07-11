import { Decor } from "../decor";
import { DecorConsumerLoader, decorConsumerRegistry } from "../decor/decor-consumer-registry";
import { Model } from "../model";

/**
 * Create a method decorator for consuming decor from selected producers.
 *
 * The loader receives the consumer model and returns the producer model(s) plus
 * the decor type to consume. The method receives decor instances whenever a
 * matching producer recomputes its decorated value.
 *
 * @param loader - Selects producer target(s) and the decor constructor.
 * @returns Method decorator for decor consumer handlers.
 */
export function useDecorConsumer<
    D extends Decor,
    I extends Model
>(loader: DecorConsumerLoader<I, D>) {
    return function(
        prototype: I,
        key: string,
        descriptor: TypedPropertyDescriptor<(decor: D) => void>,
    ) {
        decorConsumerRegistry.register(prototype, key, descriptor, loader);
        return descriptor;
    }
}
