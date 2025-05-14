import { Agent } from "@/agent";
import { Callback } from "@/types";
import { ModelCycle } from "@/utils/cycle";

export enum LogLevel {
    INFO = 0,
    WARN = 1,
    ERROR = 2,
}

export class DebugService {
    private static readonly stack: string[] = []

    public static log() {
        return function(
            target: Object,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Object, ...args: any[]) {
                    const namespace = this.constructor.name + '::' + key
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

    public static mute() {
        return function(
            target: Object,
            key: string,
            descriptor: TypedPropertyDescriptor<Callback>
        ): TypedPropertyDescriptor<Callback> {
            const handler = descriptor.value;
            if (!handler) return descriptor;
            const instance = {
                [key](this: Object, ...args: any[]) {
                    const consoleOrigin = console;
                    console = new Proxy({} as any, {
                        get() { return () => undefined }
                    })
                    const result = handler.call(this, ...args);
                    console = consoleOrigin;
                    return result;
                }
            }
            descriptor.value = instance[key];
            return descriptor;
        };
    }

    private constructor() {}
}