import { Model } from "../model";
import { checkTransactionStatus, runTrx } from "./use-trx";

export const coroutineContext: Array<() => void> = [];

export function useCoroutine() {
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
                coroutineContext.push(method);
                return;
            }
            method.call(this);
        }
        return descriptor;
    }
}

export function appendCoroutine(thread: () => void) {
    const isPending = checkTransactionStatus();
    if (isPending) {
        coroutineContext.push(thread);
        return;
    }
    thread();
}

export function runCoroutines() {
    const prevThreads = [...coroutineContext];
    coroutineContext.length = 0;
    prevThreads.forEach(thread => {
        thread();
    });
}