import { trxManager } from "./trx-manager";

export function useDefer<T extends object>() {
    return function(
        prototype: T,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ) {
        const method = descriptor.value;
        if (!method) return;
        descriptor.value = function(this: T) {
            trxManager.then(method.bind(this));
        }
        return descriptor;
    }
}

