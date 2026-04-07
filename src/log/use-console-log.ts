import { Model } from "../model";

export function useConsoleLog() {
    return function(
        model: Model,
        key: string,
        descriptor: TypedPropertyDescriptor<any>,
    ) {
        const method = descriptor.value;
        if (!method) return descriptor;
        descriptor.value = function(...args: any[]) {
            console.group(`${model.constructor.name} ${key}`);
            const result = method.apply(this, args);
            console.groupEnd();
            return result;
        }
        return descriptor;
    }
}