import { Model } from "../model";
import { Method } from "../types";
import { runThreads, threads } from "./as-thread";

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
            runThreads();
        }
        return descriptor;
    }   
}


export function runTransaction(
    method: () => void
) {
    if (isPending) {
        return method();
    }
    isPending = true;
    method();
    isPending = false;
    runThreads();
}

