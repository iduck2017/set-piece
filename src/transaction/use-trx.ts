import { Model } from "../model";
import { Method } from "../types";
import { runCoroutines, coroutineContext } from "./use-coroutine";

let isPending = false;
export function checkTransactionStatus() {
    return isPending;
}

export function useTrx() {
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
            runCoroutines();
        }
        return descriptor;
    }   
}


export function runTrx(
    method: () => void
) {
    if (isPending) {
        return method();
    }
    isPending = true;
    method();
    isPending = false;
    runCoroutines();
}

