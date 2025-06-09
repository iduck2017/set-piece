import { Agent } from "../agent/agent";
import {  Model } from "../model";

type Callback<R = any, P extends any[] = any[]> = (...args: P) => R

export class DebugService {
    private static readonly stack: string[] = []

    public static log<T extends Object>(accessor?: (target: T) => string) {
        return function(
            target: T,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: T, ...args: any[]) {

                    const name = accessor?.(this) ?? this.constructor.name
                    console.group(name + '::' + key)

                    DebugService.stack.push(name);
                    const result = handler.call(this, ...args);
                    DebugService.stack.pop();
                  
                    console.groupEnd()
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        };
    }

    private constructor() {}
}