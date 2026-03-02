import { Model } from "../model";
import { Method } from "../types";
import { threads } from "./as-thread";

let isPending = false;
export function checkTransactionStatus() {
    return isPending;
}

export function asTransaction() {
    return function(
        prototype: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<Method<any>>,
    ) {    
        const method = descriptor.value;
        if (!method) return descriptor;
        descriptor.value = function(...args: any[]) {
            if (isPending) {
                return method.call(this, ...args);
            }
            isPending = true;
            method.call(this, ...args);
            isPending = false;
            const prevThreads = threads;
            threads.length = 0;
            prevThreads.forEach(thread => {
                thread();
            });
        }
        return descriptor;
    }   
}
