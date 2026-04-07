import { Model } from "../model";
import { Method } from "../types";
import { trxManager } from "./trx-manager";

export function useTrx() {
    return function(
        _proto: Model,
        _key: string,
        desc: TypedPropertyDescriptor<Method>,
    ) {
        const method = desc.value;
        if (!method) return desc;
        desc.value = function(...args: any[]) {
            trxManager.run(method.bind(this, ...args));
        }
        return desc;
    }
}
