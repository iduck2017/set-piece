import { Agent } from "../agent/agent";
import {  Model } from "../model";

type Callback<R = any, P extends any[] = any[]> = (...args: P) => R

export class DebugService {
    private static readonly stack: string[] = []

    public static log() {
        return function(
            target: Model | Agent,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Model | Agent, ...args: any[]) {
                    const namespace = this.target.name + '::' + key
                    console.group(namespace)

                    DebugService.stack.push(namespace);
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