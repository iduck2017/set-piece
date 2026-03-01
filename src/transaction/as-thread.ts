import { Model } from "../model";
import { checkTransactionStatus } from "./as-transaction";

export const threads: Array<() => void> = [];

export function asThread() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ) {
        const method = descriptor.value;
        if (!method) return;
        descriptor.value = function() {
            const isPending = checkTransactionStatus();
            if (isPending) {
                threads.push(method);
                return;
            }
            return method.call(this);
        }
        return descriptor;
    }
}

export function appendThread(thread: () => void) {
    threads.push(thread);
}