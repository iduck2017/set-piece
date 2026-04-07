import { AbstractConstructor } from "../types";

export function getTypes<T extends object>(target: T) {
    let constructor: any = target.constructor;
    const result: AbstractConstructor<T>[] = [];
    while (constructor) {
        result.push(constructor);
        constructor = Object.getPrototypeOf(constructor);
    }
    return result;
}
