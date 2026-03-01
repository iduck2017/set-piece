import { Model } from "../model";
import { threads } from "./as-thread";

let isPending = false;
export function checkTransactionStatus() {
    return isPending;
}

export function asTransaction() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<() => void>,
    ): TypedPropertyDescriptor<() => void> {    
        const method = descriptor.value;
        if (!method) return descriptor;
        descriptor.value = function() {
            if (isPending) {
                return method.call(this);
            }
            isPending = true;
            method.call(this);
            isPending = false;
            const prevThreads = threads;
            threads.length = 0;
            prevThreads.forEach(callback => {
                callback();
            });
        }
        return descriptor;
    }   
}
