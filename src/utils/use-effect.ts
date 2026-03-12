import { Model } from "../model";
import { runCoroutine } from "../transaction/use-coroutine";
import { getDescriptor } from "./get-descriptor";

export function useEffect<
    I extends Model & Record<string, any>,
    K extends string,
>(
    handler: (self: I, prev: I[K]) => void
) {
    return function(
        prototype: I,
        key: K,
    ) {
        const { getter, setter } = getDescriptor(prototype, key);
        Object.defineProperty(prototype, key, {
            get() {
                return getter.call(this);
            },
            set(value) {
                const prev = Reflect.get(this, key);
                setter.call(this, value);
                const next = Reflect.get(this, key);
                if (prev !== next) {
                    handler(this, prev);
                }
            },
            configurable: true,
        })
    }
}